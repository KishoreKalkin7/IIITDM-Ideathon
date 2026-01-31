"""
Fraud Detection Service - Image Authenticity Check
Implements basic checks to detect AI-generated or fake images
"""

import os
from typing import Dict, List
from PIL import Image


class FraudDetectionService:
    """
    Service for detecting potentially fraudulent return images.
    Uses basic image analysis without heavy AI models.
    """
    
    # Configuration thresholds
    MIN_RESOLUTION = 300  # Minimum width or height in pixels
    MIN_FILE_SIZE_KB = 50  # Minimum file size in KB
    MAX_FILE_SIZE_MB = 20  # Maximum file size in MB
    SUSPICIOUS_SCORE_THRESHOLD = 60  # Score above this is suspicious
    
    def check_image_authenticity(
        self,
        image_path: str,
        metadata: dict,
        image_hash: str,
        delivery_image_hash: str
    ) -> dict:
        """
        Run multiple checks to determine if an image is authentic or suspicious.
        
        This is a FROM-SCRATCH implementation using basic image properties:
        - Resolution check (too low resolution is suspicious)
        - File size check (suspiciously small or large files)
        - Metadata availability (lack of EXIF data can indicate manipulation)
        - Duplicate detection (same image as delivery = fraud attempt)
        
        Args:
            image_path: Path to the return image
            metadata: Image metadata dictionary
            image_hash: Hash of the return image
            delivery_image_hash: Hash of the delivery image
        
        Returns:
            Dictionary with authenticity analysis results
        """
        flags = []
        checks_performed = {}
        suspicion_points = 0
        
        # CHECK 1: Resolution Check
        # Real photos from modern phones typically have good resolution
        width = metadata.get("width", 0)
        height = metadata.get("height", 0)
        
        if width < self.MIN_RESOLUTION or height < self.MIN_RESOLUTION:
            flags.append("Low resolution image - may be screenshot or edited")
            suspicion_points += 25
            checks_performed["resolution_check"] = False
        else:
            checks_performed["resolution_check"] = True
        
        # CHECK 2: File Size Check
        # Suspiciously small files might be compressed/edited
        # Suspiciously large files might be manipulated
        file_size_kb = metadata.get("file_size_kb", 0)
        file_size_mb = file_size_kb / 1024
        
        if file_size_kb < self.MIN_FILE_SIZE_KB:
            flags.append("File size too small - possible screenshot or heavily compressed")
            suspicion_points += 20
            checks_performed["file_size_check"] = False
        elif file_size_mb > self.MAX_FILE_SIZE_MB:
            flags.append("File size unusually large - possible manipulation")
            suspicion_points += 15
            checks_performed["file_size_check"] = False
        else:
            checks_performed["file_size_check"] = True
        
        # CHECK 3: Metadata/EXIF Check
        # Real photos from cameras/phones usually have EXIF data
        # Edited or AI-generated images often lack proper EXIF
        has_exif = metadata.get("has_exif", False)
        
        if not has_exif:
            flags.append("No EXIF metadata found - image may be edited or AI-generated")
            suspicion_points += 20
            checks_performed["metadata_check"] = False
        else:
            checks_performed["metadata_check"] = True
        
        # CHECK 4: Duplicate Image Detection
        # Customer using same image for delivery and return = clear fraud
        if image_hash == delivery_image_hash:
            flags.append("CRITICAL: Return image is identical to delivery image - fraud attempt detected")
            suspicion_points += 100  # Instant high suspicion
            checks_performed["duplicate_check"] = False
        else:
            checks_performed["duplicate_check"] = True
        
        # CHECK 5: Format Check
        # AI generators often produce PNG, while real photos are usually JPG
        image_format = metadata.get("format", "").upper()
        if image_format == "PNG" and not has_exif:
            flags.append("PNG format without metadata - common for AI-generated images")
            suspicion_points += 15
            checks_performed["format_check"] = False
        else:
            checks_performed["format_check"] = True
        
        # Calculate confidence score (0-100)
        # Higher score = more suspicious
        confidence_score = min(suspicion_points, 100)
        
        # Determine if image is suspicious
        is_suspicious = confidence_score >= self.SUSPICIOUS_SCORE_THRESHOLD
        
        return {
            "is_suspicious": is_suspicious,
            "confidence_score": confidence_score,
            "checks_performed": checks_performed,
            "flags": flags,
            "details": {
                "resolution": f"{width}x{height}",
                "file_size_kb": file_size_kb,
                "has_metadata": has_exif,
                "is_duplicate": image_hash == delivery_image_hash,
                "format": image_format
            }
        }
    
    def calculate_fraud_risk_score(
        self,
        authenticity_result: dict,
        return_reason: str,
        product_category: str,
        time_since_delivery: int
    ) -> float:
        """
        Calculate overall fraud risk score based on multiple factors.
        
        Args:
            authenticity_result: Result from image authenticity check
            return_reason: Reason for return
            product_category: Product category
            time_since_delivery: Hours since delivery
        
        Returns:
            Fraud risk score (0-100)
        """
        fraud_score = authenticity_result["confidence_score"]
        
        # Adjust based on timing
        # Very quick returns (< 2 hours) or very late returns are suspicious
        if time_since_delivery < 2:
            fraud_score += 10
        elif product_category.lower() == "food" and time_since_delivery > 48:
            fraud_score += 15
        
        # Cap at 100
        return min(fraud_score, 100)
