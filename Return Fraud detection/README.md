# Return Product Fraud Detection System

## 🎯 Problem Statement

E-commerce platforms face massive losses due to return fraud:
- **Wardrobing**: Customers use products and return them
- **Fake Damage Claims**: Customers claim products are damaged with manipulated images
- **Missing Accountability**: No proof of product condition at delivery
- **Food Product Misuse**: Customers blame platform after consuming perishable items

**Industry Impact**: Return fraud costs retailers billions annually, with damaged product claims being the most exploited category.

---

## 💡 Solution Overview

A smart backend system that **prevents return fraud before it happens** through:

### 1. **Mandatory Delivery Confirmation** 
Every customer MUST upload a product image upon delivery. This creates an immutable baseline reference.

### 2. **Intelligent Return Processing**
Returns are processed with multi-layer verification:
- ✅ Delivery image existence check
- ✅ Time-based validation for perishable goods
- ✅ AI-generated image detection
- ✅ Duplicate image detection

### 3. **Smart Decision Engine**
Automatically approves, flags for review, or rejects returns based on:
- Image authenticity score
- Product category rules
- Return timing patterns
- Historical fraud indicators

---

## 🛡️ How Return Fraud is Reduced

### **Before This System:**
```
Customer receives product → No accountability → Claims damage after 2 weeks 
→ Uses AI-generated/edited image → Platform loses money
```

### **With This System:**
```
Customer receives product → MUST upload delivery photo → Creates baseline
→ Customer requests return → System checks:
   ├─ Is delivery photo available? ❌ → REJECT
   ├─ Is return image authentic? ❌ → REJECT/REVIEW
   ├─ Is timing suspicious? ❌ → REJECT
   └─ All checks pass? ✅ → APPROVE
```

### **Key Fraud Prevention Mechanisms:**

1. **Delivery Photo Mandate**
   - Creates accountability at point of delivery
   - Prevents later claims like "product was already damaged"

2. **Duplicate Detection**
   - Compares delivery image hash with return image hash
   - Catches customers reusing the same photo

3. **AI-Generated Image Detection** (From Scratch)
   - Resolution analysis (AI images often have unusual dimensions)
   - EXIF metadata verification (AI images lack camera metadata)
   - File size patterns (edited images have different compression)
   - Format analysis (PNG without metadata = suspicious)

4. **Time-Based Rules**
   - Food products: 48-hour return window prevents "ate it and complained" fraud
   - Instant returns (<2 hours) flagged as suspicious
   - Late claims automatically rejected with clear reasoning

5. **Selective Verification**
   - Damaged product claims → Full authenticity check
   - Other reasons → Standard process (saves processing time)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Application                     │
├─────────────────────────────────────────────────────────────┤
│  Endpoints:                                                  │
│  • POST /delivery-confirmation  (Mandatory first step)       │
│  • POST /request-return        (Fraud-checked returns)       │
│  • GET  /order/{id}/status     (Order information)           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌──────────────────┐   ┌──────────────┐
│ Image Service │   │ Fraud Detection  │   │   Decision   │
│               │   │     Service      │   │    Engine    │
│ • Save images │   │ • Authenticity   │   │ • Business   │
│ • Extract     │   │   checks         │   │   rules      │
│   metadata    │   │ • Fraud scoring  │   │ • Final      │
│ • Hash calc   │   │ • From-scratch   │   │   decision   │
└───────────────┘   └──────────────────┘   └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Storage Manager  │
                    │                  │
                    │ • Local files    │
                    │ • JSON records   │
                    │ • Image storage  │
                    └──────────────────┘
```

---

## 🚀 How to Run

### **Prerequisites**
- Python 3.8 or higher
- pip (Python package manager)

### **Step 1: Install Dependencies**
```bash
pip install -r requirements.txt
```

### **Step 2: Run the Server**
```bash
python main.py
```

The server will start at: `http://localhost:8000`

### **Step 3: Test the API**

**Interactive API Documentation:**
Open your browser and visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📋 API Usage Examples

### **1. Delivery Confirmation (Mandatory First Step)**

```bash
curl -X POST "http://localhost:8000/delivery-confirmation" \
  -F "order_id=ORDER123" \
  -F "product_category=electronics" \
  -F "delivery_image=@product_photo.jpg"
```

**Response:**
```json
{
  "status": "success",
  "message": "Delivery confirmed successfully. Image saved as baseline reference.",
  "order_id": "ORDER123",
  "product_category": "electronics",
  "delivery_timestamp": "2026-01-30T10:30:00",
  "image_path": "storage/images/ORDER123/delivery_20260130_103000.jpg"
}
```

### **2. Request Return (With Fraud Detection)**

```bash
curl -X POST "http://localhost:8000/request-return" \
  -F "order_id=ORDER123" \
  -F "return_reason=Damaged Product" \
  -F "product_category=electronics" \
  -F "time_since_delivery=24" \
  -F "return_image=@damaged_product.jpg"
```

**Response (Approved):**
```json
{
  "status": "success",
  "decision": "Approved",
  "order_id": "ORDER123",
  "explanation": "Return approved for damaged product (fraud score: 25.0/100). Image authenticity verified.",
  "fraud_score": 25.0,
  "authenticity_details": {
    "is_suspicious": false,
    "confidence_score": 25.0,
    "checks_performed": {
      "resolution_check": true,
      "file_size_check": true,
      "metadata_check": true,
      "duplicate_check": true
    },
    "flags": []
  }
}
```

**Response (Rejected - High Fraud Score):**
```json
{
  "status": "success",
  "decision": "Rejected",
  "order_id": "ORDER123",
  "explanation": "Return rejected due to high fraud risk (score: 85.0/100). Issues: Low resolution, No EXIF metadata, PNG format without metadata",
  "fraud_score": 85.0
}
```

**Response (No Delivery Photo):**
```json
{
  "status": "rejected",
  "decision": "Rejected",
  "order_id": "ORDER456",
  "explanation": "Return request rejected. No delivery confirmation found. Customers must upload a delivery image upon receiving the product."
}
```

### **3. Check Order Status**

```bash
curl "http://localhost:8000/order/ORDER123/status"
```

---

## 🧪 Testing Scenarios

### **Scenario 1: Normal Legitimate Return**
1. Upload delivery photo (high quality JPG with EXIF)
2. Wait 24 hours
3. Request return with different damage photo
4. ✅ Result: **Approved**

### **Scenario 2: Duplicate Image Fraud**
1. Upload delivery photo
2. Request return with SAME image
3. ✅ Result: **Rejected** (duplicate detected)

### **Scenario 3: AI-Generated Image Fraud**
1. Upload delivery photo
2. Use AI-generated damage image (PNG, no EXIF, low res)
3. ✅ Result: **Rejected** (high fraud score)

### **Scenario 4: Food Product Late Return**
1. Upload delivery photo for food item
2. Wait 60 hours (> 48 hour limit)
3. Request return
4. ✅ Result: **Rejected** (time limit exceeded)

### **Scenario 5: No Delivery Photo**
1. Skip delivery confirmation
2. Try to request return
3. ✅ Result: **Rejected** (no baseline reference)

---

## 📁 Project Structure

```
return-fraud-detection/
├── main.py                          # FastAPI application entry point
├── requirements.txt                 # Python dependencies
├── README.md                        # This file
│
├── models/
│   ├── __init__.py
│   └── schemas.py                   # Pydantic models for API
│
├── services/
│   ├── __init__.py
│   ├── image_service.py             # Image upload and metadata extraction
│   ├── fraud_detection_service.py   # Image authenticity checks (FROM SCRATCH)
│   └── decision_engine.py           # Business logic and decision making
│
├── utils/
│   ├── __init__.py
│   └── storage.py                   # Local file storage manager
│
└── storage/                         # Auto-created on first run
    ├── images/                      # Uploaded images
    │   └── {order_id}/
    │       ├── delivery_*.jpg
    │       └── return_*.jpg
    └── records/                     # Order records
        ├── deliveries/
        │   └── {order_id}.json
        └── returns/
            └── {order_id}.json
```

---

## 🎓 Demo Talking Points (For Ideathon)

### **1. Problem Impact**
"Return fraud costs e-commerce billions. Our system prevents fraud BEFORE it happens."

### **2. Key Innovation**
"Mandatory delivery photos create accountability. No photo = no return eligibility."

### **3. Technical Highlight**
"We built image authenticity detection FROM SCRATCH - no heavy AI models needed. Our algorithm checks resolution, metadata, duplicates, and file patterns."

### **4. Business Rules**
"Smart category-based rules: Food has 48-hour limit. Damaged claims get full verification. Other returns use fast-track."

### **5. Scalability**
"Built with FastAPI for high performance. Modular design allows easy integration into existing platforms."

### **6. Real Results**
"Catches duplicate images, AI-generated fakes, and timing-based fraud automatically."

---

## 🔧 Future Enhancements (Post-MVP)

- [ ] Cloud storage integration (AWS S3, Google Cloud Storage)
- [ ] Advanced ML models for damage verification
- [ ] Real-time image comparison algorithms
- [ ] Customer fraud history tracking
- [ ] Admin dashboard for manual review
- [ ] Integration with shipping/logistics APIs
- [ ] Webhook notifications
- [ ] Multi-tenant support
- [ ] Analytics and fraud pattern detection

---

## 🏆 Why This Wins

1. **Solves Real Problem**: Addresses billion-dollar industry issue
2. **Production-Ready**: Clean code, proper structure, API documentation
3. **Innovative Approach**: Mandatory delivery photos (not commonly implemented)
4. **From-Scratch AI**: Custom fraud detection without heavy dependencies
5. **Business-Focused**: Clear ROI - prevents fraud, reduces losses
6. **Scalable Design**: Easy to integrate and extend
7. **Demo-Ready**: Works out of the box, clear test scenarios

---

## 📄 License

This is a demo MVP for educational/competition purposes.

---

## 👥 Contact

Built for IIITDM Ideathon 2026

**Tech Stack**: Python, FastAPI, PIL, Pydantic
**Deployment Ready**: Yes
**Demo Ready**: Yes
**Production Ready**: MVP stage

---

## 🎯 Key Takeaway

**This system doesn't just detect fraud - it PREVENTS it through smart accountability and automated verification.**

Good luck with your demo! 🚀
