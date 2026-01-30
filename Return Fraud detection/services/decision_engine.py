"""
Decision Engine - Core business logic for return approval/rejection
Combines all checks to make final decision
"""

from models.schemas import ReturnDecision
from services.fraud_detection_service import FraudDetectionService
from utils.storage import StorageManager


class DecisionEngine:
    """
    Decision Engine that implements the core business logic.
    
    DECISION FLOW:
    1. Check if delivery image exists (already verified in main.py)
    2. For food products: Check time limit
    3. For damaged products: Run authenticity check
    4. Combine all factors to make final decision
    """
    
    # Business rules configuration
    FOOD_RETURN_TIME_LIMIT_HOURS = 48  # Food must be returned within 48 hours
    HIGH_FRAUD_SCORE_THRESHOLD = 70  # Score above this = auto-reject
    MEDIUM_FRAUD_SCORE_THRESHOLD = 40  # Score above this = manual review
    
    def __init__(self, fraud_detection_service: FraudDetectionService):
        self.fraud_service = fraud_detection_service
    
    async def process_return_request(
        self,
        order_id: str,
        return_reason: str,
        product_category: str,
        time_since_delivery: int,
        return_image_path: str,
        delivery_record: dict
    ) -> dict:
        """
        Process return request and make final decision.
        
        Args:
            order_id: Order identifier
            return_reason: Reason for return
            product_category: Product category
            time_since_delivery: Hours since delivery
            return_image_path: Path to return image
            delivery_record: Delivery confirmation record
        
        Returns:
            Dictionary with decision and explanation
        """
        
        # STEP 1: Food Product Time Validation
        # Food products have strict time limits to prevent misuse
        if product_category.lower() == "food":
            if time_since_delivery > self.FOOD_RETURN_TIME_LIMIT_HOURS:
                return {
                    "decision": ReturnDecision.REJECTED,
                    "explanation": (
                        f"Return rejected for food product. Return requested {time_since_delivery} hours "
                        f"after delivery, exceeding the {self.FOOD_RETURN_TIME_LIMIT_HOURS}-hour limit. "
                        "This policy prevents misuse and ensures food safety standards."
                    ),
                    "fraud_score": None,
                    "authenticity_details": None
                }
        
        # STEP 2: Image Authenticity Check (ONLY for Damaged Products)
        authenticity_result = None
        fraud_score = None
        
        if return_reason.lower() == "damaged product":
            # Get return image metadata from storage
            import json
            return_metadata_path = return_image_path.replace(".jpg", "_metadata.json").replace(".png", "_metadata.json")
            
            try:
                with open(return_metadata_path, 'r') as f:
                    return_metadata = json.load(f)
            except:
                return_metadata = {}
            
            # Get delivery image hash
            delivery_image_hash = delivery_record.get("image_hash", "")
            
            # Run authenticity check
            authenticity_result = self.fraud_service.check_image_authenticity(
                image_path=return_image_path,
                metadata=return_metadata,
                image_hash=return_metadata.get("image_hash", ""),
                delivery_image_hash=delivery_image_hash
            )
            
            # Calculate overall fraud risk
            fraud_score = self.fraud_service.calculate_fraud_risk_score(
                authenticity_result=authenticity_result,
                return_reason=return_reason,
                product_category=product_category,
                time_since_delivery=time_since_delivery
            )
        
        # STEP 3: Make Final Decision
        decision_result = self._make_decision(
            return_reason=return_reason,
            product_category=product_category,
            authenticity_result=authenticity_result,
            fraud_score=fraud_score,
            time_since_delivery=time_since_delivery
        )
        
        return decision_result
    
    def _make_decision(
        self,
        return_reason: str,
        product_category: str,
        authenticity_result: dict,
        fraud_score: float,
        time_since_delivery: int
    ) -> dict:
        """
        Make final decision based on all factors.
        
        Returns:
            Dictionary with decision, explanation, and details
        """
        
        # For non-damaged returns, approve with standard process
        if return_reason.lower() != "damaged product":
            return {
                "decision": ReturnDecision.APPROVED,
                "explanation": (
                    f"Return approved for reason: {return_reason}. "
                    "No image authenticity check required for non-damage returns. "
                    "Proceed with standard return process."
                ),
                "fraud_score": None,
                "authenticity_details": None
            }
        
        # For damaged products, use fraud score
        if fraud_score >= self.HIGH_FRAUD_SCORE_THRESHOLD:
            return {
                "decision": ReturnDecision.REJECTED,
                "explanation": (
                    f"Return rejected due to high fraud risk (score: {fraud_score:.1f}/100). "
                    f"Image authenticity check failed. Issues detected: {', '.join(authenticity_result['flags'])}. "
                    "Please contact customer support with genuine product images."
                ),
                "fraud_score": fraud_score,
                "authenticity_details": authenticity_result
            }
        
        elif fraud_score >= self.MEDIUM_FRAUD_SCORE_THRESHOLD:
            return {
                "decision": ReturnDecision.REVIEW,
                "explanation": (
                    f"Return flagged for manual review (fraud score: {fraud_score:.1f}/100). "
                    f"Some authenticity concerns detected: {', '.join(authenticity_result['flags'][:2])}. "
                    "A customer service representative will review your case within 24 hours."
                ),
                "fraud_score": fraud_score,
                "authenticity_details": authenticity_result
            }
        
        else:
            return {
                "decision": ReturnDecision.APPROVED,
                "explanation": (
                    f"Return approved for damaged product (fraud score: {fraud_score:.1f}/100). "
                    "Image authenticity verified. Return pickup will be arranged within 24-48 hours."
                ),
                "fraud_score": fraud_score,
                "authenticity_details": authenticity_result
            }
