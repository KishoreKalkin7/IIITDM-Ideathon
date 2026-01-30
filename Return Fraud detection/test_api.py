"""
Test script to demonstrate the API functionality
Run this after starting the server to see the fraud detection in action
"""

import requests
import io
from PIL import Image
import time

BASE_URL = "http://localhost:8000"


def create_test_image(width=1920, height=1080, color="red", has_exif=True):
    """Create a test image for demonstration"""
    img = Image.new('RGB', (width, height), color=color)
    img_bytes = io.BytesIO()
    
    # Save as JPEG (has EXIF) or PNG (no EXIF)
    format_type = "JPEG" if has_exif else "PNG"
    img.save(img_bytes, format=format_type, quality=95)
    img_bytes.seek(0)
    
    return img_bytes


def test_delivery_confirmation():
    """Test 1: Delivery Confirmation"""
    print("\n" + "="*60)
    print("TEST 1: DELIVERY CONFIRMATION")
    print("="*60)
    
    # Create a good quality delivery image
    delivery_image = create_test_image(1920, 1080, "blue", has_exif=True)
    
    response = requests.post(
        f"{BASE_URL}/delivery-confirmation",
        data={
            "order_id": "ORDER_TEST_001",
            "product_category": "electronics"
        },
        files={
            "delivery_image": ("delivery.jpg", delivery_image, "image/jpeg")
        }
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json()


def test_legitimate_return():
    """Test 2: Legitimate Return Request"""
    print("\n" + "="*60)
    print("TEST 2: LEGITIMATE RETURN REQUEST")
    print("="*60)
    
    # Create a different, good quality return image
    return_image = create_test_image(1920, 1080, "green", has_exif=True)
    
    response = requests.post(
        f"{BASE_URL}/request-return",
        data={
            "order_id": "ORDER_TEST_001",
            "return_reason": "Damaged Product",
            "product_category": "electronics",
            "time_since_delivery": 24
        },
        files={
            "return_image": ("return.jpg", return_image, "image/jpeg")
        }
    )
    
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Decision: {result['decision']}")
    print(f"Explanation: {result['explanation']}")
    if result.get('fraud_score'):
        print(f"Fraud Score: {result['fraud_score']}/100")
    return result


def test_duplicate_image_fraud():
    """Test 3: Duplicate Image Fraud Detection"""
    print("\n" + "="*60)
    print("TEST 3: DUPLICATE IMAGE FRAUD (Using same image)")
    print("="*60)
    
    # First, create delivery confirmation
    delivery_image = create_test_image(1920, 1080, "orange", has_exif=True)
    delivery_content = delivery_image.read()
    
    requests.post(
        f"{BASE_URL}/delivery-confirmation",
        data={
            "order_id": "ORDER_TEST_002",
            "product_category": "clothing"
        },
        files={
            "delivery_image": ("delivery.jpg", io.BytesIO(delivery_content), "image/jpeg")
        }
    )
    
    # Try to return with SAME image
    response = requests.post(
        f"{BASE_URL}/request-return",
        data={
            "order_id": "ORDER_TEST_002",
            "return_reason": "Damaged Product",
            "product_category": "clothing",
            "time_since_delivery": 12
        },
        files={
            "return_image": ("return.jpg", io.BytesIO(delivery_content), "image/jpeg")
        }
    )
    
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Decision: {result['decision']}")
    print(f"Explanation: {result['explanation']}")
    if result.get('fraud_score'):
        print(f"Fraud Score: {result['fraud_score']}/100")
    return result


def test_ai_generated_image_fraud():
    """Test 4: AI-Generated Image Detection"""
    print("\n" + "="*60)
    print("TEST 4: AI-GENERATED IMAGE FRAUD (PNG, no EXIF, low res)")
    print("="*60)
    
    # Create delivery confirmation
    delivery_image = create_test_image(1920, 1080, "purple", has_exif=True)
    
    requests.post(
        f"{BASE_URL}/delivery-confirmation",
        data={
            "order_id": "ORDER_TEST_003",
            "product_category": "electronics"
        },
        files={
            "delivery_image": ("delivery.jpg", delivery_image, "image/jpeg")
        }
    )
    
    # Create suspicious image (low res, PNG, no EXIF)
    suspicious_image = create_test_image(200, 200, "red", has_exif=False)
    
    response = requests.post(
        f"{BASE_URL}/request-return",
        data={
            "order_id": "ORDER_TEST_003",
            "return_reason": "Damaged Product",
            "product_category": "electronics",
            "time_since_delivery": 48
        },
        files={
            "return_image": ("return.png", suspicious_image, "image/png")
        }
    )
    
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Decision: {result['decision']}")
    print(f"Explanation: {result['explanation']}")
    if result.get('fraud_score'):
        print(f"Fraud Score: {result['fraud_score']}/100")
    if result.get('authenticity_details'):
        print(f"Flags: {result['authenticity_details']['flags']}")
    return result


def test_food_product_time_limit():
    """Test 5: Food Product Time Limit Enforcement"""
    print("\n" + "="*60)
    print("TEST 5: FOOD PRODUCT TIME LIMIT (Late return)")
    print("="*60)
    
    # Create delivery confirmation
    delivery_image = create_test_image(1920, 1080, "yellow", has_exif=True)
    
    requests.post(
        f"{BASE_URL}/delivery-confirmation",
        data={
            "order_id": "ORDER_TEST_004",
            "product_category": "food"
        },
        files={
            "delivery_image": ("delivery.jpg", delivery_image, "image/jpeg")
        }
    )
    
    # Try to return after 72 hours (exceeds 48-hour limit)
    return_image = create_test_image(1920, 1080, "pink", has_exif=True)
    
    response = requests.post(
        f"{BASE_URL}/request-return",
        data={
            "order_id": "ORDER_TEST_004",
            "return_reason": "Damaged Product",
            "product_category": "food",
            "time_since_delivery": 72
        },
        files={
            "return_image": ("return.jpg", return_image, "image/jpeg")
        }
    )
    
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Decision: {result['decision']}")
    print(f"Explanation: {result['explanation']}")
    return result


def test_no_delivery_confirmation():
    """Test 6: Return Without Delivery Confirmation"""
    print("\n" + "="*60)
    print("TEST 6: RETURN WITHOUT DELIVERY CONFIRMATION")
    print("="*60)
    
    # Try to return without delivery confirmation
    return_image = create_test_image(1920, 1080, "cyan", has_exif=True)
    
    response = requests.post(
        f"{BASE_URL}/request-return",
        data={
            "order_id": "ORDER_TEST_999",  # Non-existent order
            "return_reason": "Not satisfied",
            "product_category": "electronics",
            "time_since_delivery": 24
        },
        files={
            "return_image": ("return.jpg", return_image, "image/jpeg")
        }
    )
    
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Decision: {result['decision']}")
    print(f"Explanation: {result['explanation']}")
    return result


def test_non_damaged_return():
    """Test 7: Non-Damaged Return (Skips fraud check)"""
    print("\n" + "="*60)
    print("TEST 7: NON-DAMAGED RETURN (No fraud check needed)")
    print("="*60)
    
    # Create delivery confirmation
    delivery_image = create_test_image(1920, 1080, "brown", has_exif=True)
    
    requests.post(
        f"{BASE_URL}/delivery-confirmation",
        data={
            "order_id": "ORDER_TEST_005",
            "product_category": "clothing"
        },
        files={
            "delivery_image": ("delivery.jpg", delivery_image, "image/jpeg")
        }
    )
    
    # Return for non-damage reason
    return_image = create_test_image(1920, 1080, "gray", has_exif=True)
    
    response = requests.post(
        f"{BASE_URL}/request-return",
        data={
            "order_id": "ORDER_TEST_005",
            "return_reason": "Not satisfied",
            "product_category": "clothing",
            "time_since_delivery": 36
        },
        files={
            "return_image": ("return.jpg", return_image, "image/jpeg")
        }
    )
    
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Decision: {result['decision']}")
    print(f"Explanation: {result['explanation']}")
    print(f"Fraud Check Performed: {'Yes' if result.get('fraud_score') else 'No (Not needed)'}")
    return result


if __name__ == "__main__":
    print("\n" + "🚀"*30)
    print("RETURN PRODUCT FRAUD DETECTION - TEST SUITE")
    print("🚀"*30)
    
    print("\nMake sure the server is running at http://localhost:8000")
    print("Starting tests in 2 seconds...\n")
    time.sleep(2)
    
    try:
        # Run all tests
        test_delivery_confirmation()
        test_legitimate_return()
        test_duplicate_image_fraud()
        test_ai_generated_image_fraud()
        test_food_product_time_limit()
        test_no_delivery_confirmation()
        test_non_damaged_return()
        
        print("\n" + "✅"*30)
        print("ALL TESTS COMPLETED!")
        print("✅"*30)
        print("\nCheck the results above to see how fraud detection works.")
        print("Visit http://localhost:8000/docs for interactive API documentation.")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server.")
        print("Please start the server first by running: python main.py")
