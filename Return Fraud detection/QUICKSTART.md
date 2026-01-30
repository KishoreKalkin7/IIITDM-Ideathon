# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies (First Time Only)
Dependencies are already installed in the virtual environment!

If you need to reinstall:
```bash
pip install -r requirements.txt
```

### Step 2: Start the Server

**Option A: Using the batch file (Windows)**
```bash
run_server.bat
```

**Option B: Manual command**
```bash
python main.py
```

The server will start at: **http://localhost:8000**

### Step 3: Test the API

**Option A: Interactive Swagger UI**
Open your browser and visit: **http://localhost:8000/docs**

**Option B: Run automated tests**
In a new terminal:
```bash
run_tests.bat
```

Or manually:
```bash
python test_api.py
```

---

## 📖 API Endpoints

### 1. Delivery Confirmation
```
POST /delivery-confirmation
```
Upload a photo when product is delivered (mandatory).

### 2. Request Return
```
POST /request-return
```
Request a return with fraud detection.

### 3. Order Status
```
GET /order/{order_id}/status
```
Check delivery and return status.

---

## 🎯 Test Scenarios Included

The `test_api.py` script demonstrates:

1. ✅ **Normal delivery confirmation**
2. ✅ **Legitimate return request** (approved)
3. ❌ **Duplicate image fraud** (rejected)
4. ❌ **AI-generated image fraud** (rejected)
5. ❌ **Food product late return** (rejected)
6. ❌ **No delivery confirmation** (rejected)
7. ✅ **Non-damaged return** (approved, no fraud check)

---

## 📁 What Gets Created

When you run the server, it creates:
```
storage/
├── images/           # Uploaded images
│   └── {order_id}/
│       ├── delivery_*.jpg
│       └── return_*.jpg
└── records/          # Order metadata
    ├── deliveries/
    │   └── {order_id}.json
    └── returns/
        └── {order_id}.json
```

---

## 🔧 Troubleshooting

**Port already in use?**
Edit `main.py` and change the port:
```python
uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
```

**Import errors?**
Make sure you're using the virtual environment:
```bash
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
```

---

## 🎓 For Your Demo

1. Start with the problem: "Return fraud costs billions"
2. Show the solution: "Mandatory delivery photos + smart fraud detection"
3. Run live demo using Swagger UI at `/docs`
4. Show rejection of duplicate/AI images
5. Explain the business impact

---

## 📞 Need Help?

Check the full README.md for detailed documentation.

**Happy coding! 🚀**
