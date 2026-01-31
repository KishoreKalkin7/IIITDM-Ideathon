"""
Bulk Upload Service for Product Management
Handles CSV/Excel file parsing and validation for bulk product uploads
"""

import pandas as pd
from typing import Dict, List, Tuple
import io

class BulkUploadService:
    """Service to handle bulk product uploads from CSV/Excel files"""
    
    REQUIRED_FIELDS = ['name', 'category', 'price', 'stock']
    OPTIONAL_FIELDS = ['discount', 'combo_offer', 'image_url']
    VALID_CATEGORIES = [
        'Beverages', 'Junk', 'Healthy', 'Essentials', 
        'Soft Drinks', 'Juices', 'Chips', 'Biscuits',
        'Personal Care', 'Daily Groceries', 'Packaged Foods'
    ]
    
    def __init__(self):
        """Initialize the bulk upload service"""
        pass
    
    def parse_file(self, file_content: bytes, filename: str) -> pd.DataFrame:
        """
        Parse CSV or Excel file content into a DataFrame
        
        Args:
            file_content: Raw file bytes
            filename: Name of the uploaded file
            
        Returns:
            pandas DataFrame with parsed data
            
        Raises:
            ValueError: If file format is not supported
        """
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
            elif filename.endswith('.xlsx') or filename.endswith('.xls'):
                df = pd.read_excel(io.BytesIO(file_content))
            else:
                raise ValueError("Unsupported file format. Please upload .csv or .xlsx files only.")
            
            return df
        except Exception as e:
            raise ValueError(f"Failed to parse file: {str(e)}")
    
    def validate_row(self, row: pd.Series, row_num: int) -> Tuple[bool, str]:
        """
        Validate a single row of product data
        
        Args:
            row: pandas Series representing one product
            row_num: Row number for error reporting
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        errors = []
        
        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if field not in row or pd.isna(row[field]) or str(row[field]).strip() == '':
                errors.append(f"Missing required field: {field}")
        
        if errors:
            return False, f"Row {row_num}: " + "; ".join(errors)
        
        # Validate data types
        try:
            price = float(row['price'])
            if price < 0:
                errors.append("Price must be non-negative")
        except (ValueError, TypeError):
            errors.append("Price must be a valid number")
        
        try:
            stock = int(row['stock'])
            if stock < 0:
                errors.append("Stock must be non-negative")
        except (ValueError, TypeError):
            errors.append("Stock must be a valid integer")
        
        # Validate category
        if row['category'] not in self.VALID_CATEGORIES:
            errors.append(f"Invalid category. Must be one of: {', '.join(self.VALID_CATEGORIES)}")
        
        # Validate optional discount field
        if 'discount' in row and not pd.isna(row['discount']):
            try:
                discount = float(row['discount'])
                if discount < 0 or discount > 100:
                    errors.append("Discount must be between 0 and 100")
            except (ValueError, TypeError):
                errors.append("Discount must be a valid number")
        
        if errors:
            return False, f"Row {row_num}: " + "; ".join(errors)
        
        return True, ""
    
    def validate_dataframe(self, df: pd.DataFrame) -> Tuple[List[Dict], List[str]]:
        """
        Validate entire DataFrame and return valid products and errors
        
        Args:
            df: pandas DataFrame containing product data
            
        Returns:
            Tuple of (valid_products, error_messages)
        """
        valid_products = []
        errors = []
        
        # Normalize column names (strip whitespace, lowercase)
        df.columns = df.columns.str.strip().str.lower()
        
        for idx, row in df.iterrows():
            is_valid, error_msg = self.validate_row(row, idx + 2)  # +2 because Excel rows start at 1 and header is row 1
            
            if is_valid:
                # Build product dictionary with validated data
                product = {
                    'name': str(row['name']).strip(),
                    'category': str(row['category']).strip(),
                    'price': float(row['price']),
                    'stock_count': int(row['stock']),
                    'discount': float(row.get('discount', 0)) if 'discount' in row and not pd.isna(row.get('discount')) else 0,
                    'combo_offer': str(row.get('combo_offer', '')).strip() if 'combo_offer' in row and not pd.isna(row.get('combo_offer')) else '',
                    'imageUrl': str(row.get('image_url', '')).strip() if 'image_url' in row and not pd.isna(row.get('image_url')) else ''
                }
                valid_products.append(product)
            else:
                errors.append(error_msg)
        
        return valid_products, errors
    
    def process_upload(self, file_content: bytes, filename: str, retailer_id: str) -> Dict:
        """
        Process bulk upload file and return results
        
        Args:
            file_content: Raw file bytes
            filename: Name of the uploaded file
            retailer_id: ID of the retailer uploading products
            
        Returns:
            Dictionary with upload results including success count and errors
        """
        try:
            # Parse file
            df = self.parse_file(file_content, filename)
            
            if df.empty:
                return {
                    'status': 'error',
                    'message': 'File is empty',
                    'total_rows': 0,
                    'success_count': 0,
                    'error_count': 0,
                    'errors': []
                }
            
            # Validate data
            valid_products, errors = self.validate_dataframe(df)
            
            # Add retailer_id to each product
            for product in valid_products:
                product['retailerId'] = retailer_id
            
            return {
                'status': 'success',
                'message': f'Processed {len(df)} rows',
                'total_rows': len(df),
                'success_count': len(valid_products),
                'error_count': len(errors),
                'valid_products': valid_products,
                'errors': errors
            }
            
        except ValueError as e:
            return {
                'status': 'error',
                'message': str(e),
                'total_rows': 0,
                'success_count': 0,
                'error_count': 1,
                'errors': [str(e)]
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Unexpected error: {str(e)}',
                'total_rows': 0,
                'success_count': 0,
                'error_count': 1,
                'errors': [str(e)]
            }
