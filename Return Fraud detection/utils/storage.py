"""
Storage Manager - Local file storage for images and metadata
"""

import os
import json
from datetime import datetime
from typing import Optional, Dict


class StorageManager:
    """
    Manages local file storage for images and order records.
    In production, this would be replaced with cloud storage (S3, etc.)
    """
    
    def __init__(self, base_path: str = "storage"):
        """
        Initialize storage manager.
        
        Args:
            base_path: Base directory for storage
        """
        self.base_path = base_path
        self.images_path = os.path.join(base_path, "images")
        self.records_path = os.path.join(base_path, "records")
        
        # Create directories if they don't exist
        os.makedirs(self.images_path, exist_ok=True)
        os.makedirs(self.records_path, exist_ok=True)
        os.makedirs(os.path.join(self.records_path, "deliveries"), exist_ok=True)
        os.makedirs(os.path.join(self.records_path, "returns"), exist_ok=True)
    
    def save_image(
        self,
        image_content: bytes,
        order_id: str,
        image_type: str  # 'delivery' or 'return'
    ) -> str:
        """
        Save image to local storage.
        
        Args:
            image_content: Raw image bytes
            order_id: Order identifier
            image_type: Type of image ('delivery' or 'return')
        
        Returns:
            Path to saved image
        """
        # Create order-specific directory
        order_dir = os.path.join(self.images_path, order_id)
        os.makedirs(order_dir, exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{image_type}_{timestamp}.jpg"
        filepath = os.path.join(order_dir, filename)
        
        # Save image
        with open(filepath, 'wb') as f:
            f.write(image_content)
        
        return filepath
    
    def save_delivery_record(self, order_id: str, record: dict):
        """
        Save delivery confirmation record.
        
        Args:
            order_id: Order identifier
            record: Delivery record dictionary
        """
        filepath = os.path.join(self.records_path, "deliveries", f"{order_id}.json")
        
        with open(filepath, 'w') as f:
            json.dump(record, f, indent=2)
    
    def get_delivery_record(self, order_id: str) -> Optional[Dict]:
        """
        Retrieve delivery record for an order.
        
        Args:
            order_id: Order identifier
        
        Returns:
            Delivery record dictionary or None if not found
        """
        filepath = os.path.join(self.records_path, "deliveries", f"{order_id}.json")
        
        if not os.path.exists(filepath):
            return None
        
        with open(filepath, 'r') as f:
            return json.load(f)
    
    def save_return_record(self, order_id: str, record: dict):
        """
        Save return request record.
        
        Args:
            order_id: Order identifier
            record: Return record dictionary
        """
        filepath = os.path.join(self.records_path, "returns", f"{order_id}.json")
        
        with open(filepath, 'w') as f:
            json.dump(record, f, indent=2)
    
    def get_return_record(self, order_id: str) -> Optional[Dict]:
        """
        Retrieve return record for an order.
        
        Args:
            order_id: Order identifier
        
        Returns:
            Return record dictionary or None if not found
        """
        filepath = os.path.join(self.records_path, "returns", f"{order_id}.json")
        
        if not os.path.exists(filepath):
            return None
        
        with open(filepath, 'r') as f:
            return json.load(f)
