"""
Image Service - Handles image upload, storage, and processing
"""

from fastapi import UploadFile
from datetime import datetime
import hashlib
import os
from PIL import Image
import io

from ..utils.storage import StorageManager


class ImageService:
    """Service for handling image operations"""
    
    def __init__(self, storage_manager: StorageManager):
        self.storage_manager = storage_manager
    
    async def save_delivery_image(
        self,
        order_id: str,
        product_category: str,
        image_file: UploadFile
    ) -> dict:
        """
        Save delivery confirmation image and extract metadata.
        
        Args:
            order_id: Unique order identifier
            product_category: Category of the product
            image_file: Uploaded image file
        
        Returns:
            Dictionary with image path, timestamp, and metadata
        """
        # Read image content
        image_content = await image_file.read()
        
        # Calculate hash for duplicate detection
        image_hash = self._calculate_hash(image_content)
        
        # Extract metadata
        metadata = self._extract_metadata(image_content)
        
        # Save image to storage
        image_path = self.storage_manager.save_image(
            image_content,
            order_id,
            "delivery"
        )
        
        # Create delivery record
        timestamp = datetime.now().isoformat()
        delivery_record = {
            "order_id": order_id,
            "product_category": product_category,
            "delivery_timestamp": timestamp,
            "image_path": image_path,
            "image_hash": image_hash,
            "image_metadata": metadata
        }
        
        # Save record
        self.storage_manager.save_delivery_record(order_id, delivery_record)
        
        return {
            "image_path": image_path,
            "timestamp": timestamp,
            "image_hash": image_hash,
            "metadata": metadata
        }
    
    async def save_return_image(
        self,
        order_id: str,
        image_file: UploadFile
    ) -> dict:
        """
        Save return request image and extract metadata.
        
        Args:
            order_id: Unique order identifier
            image_file: Uploaded image file
        
        Returns:
            Dictionary with image path and metadata
        """
        # Read image content
        image_content = await image_file.read()
        
        # Calculate hash
        image_hash = self._calculate_hash(image_content)
        
        # Extract metadata
        metadata = self._extract_metadata(image_content)
        
        # Save image to storage
        image_path = self.storage_manager.save_image(
            image_content,
            order_id,
            "return"
        )
        
        return {
            "image_path": image_path,
            "image_hash": image_hash,
            "metadata": metadata
        }
    
    def _calculate_hash(self, image_content: bytes) -> str:
        """
        Calculate SHA-256 hash of image for duplicate detection.
        
        Args:
            image_content: Raw image bytes
        
        Returns:
            Hexadecimal hash string
        """
        return hashlib.sha256(image_content).hexdigest()
    
    def _extract_metadata(self, image_content: bytes) -> dict:
        """
        Extract metadata from image including resolution, size, format.
        
        Args:
            image_content: Raw image bytes
        
        Returns:
            Dictionary with image metadata
        """
        try:
            # Open image using PIL
            image = Image.open(io.BytesIO(image_content))
            
            # Extract EXIF data if available
            exif_data = image.getexif() if hasattr(image, 'getexif') else {}
            
            metadata = {
                "format": image.format,
                "mode": image.mode,
                "width": image.width,
                "height": image.height,
                "resolution": f"{image.width}x{image.height}",
                "file_size_bytes": len(image_content),
                "file_size_kb": round(len(image_content) / 1024, 2),
                "has_exif": len(exif_data) > 0,
                "exif_tags_count": len(exif_data)
            }
            
            return metadata
            
        except Exception as e:
            return {
                "error": str(e),
                "file_size_bytes": len(image_content),
                "file_size_kb": round(len(image_content) / 1024, 2)
            }
