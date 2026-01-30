"""
Quick verification script to ensure everything is set up correctly
Run this before your demo to make sure all dependencies are installed
"""

import sys

def check_imports():
    """Verify all required packages are installed"""
    print("="*60)
    print("VERIFICATION: Checking Python Environment")
    print("="*60)
    print()
    
    required_packages = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("pydantic", "Pydantic"),
        ("PIL", "Pillow"),
        ("multipart", "python-multipart"),
    ]
    
    all_good = True
    
    for module_name, package_name in required_packages:
        try:
            __import__(module_name)
            print(f"✅ {package_name:20} - OK")
        except ImportError:
            print(f"❌ {package_name:20} - MISSING")
            all_good = False
    
    print()
    print("="*60)
    
    if all_good:
        print("✅ ALL DEPENDENCIES INSTALLED!")
        print()
        print("You're ready to run the server:")
        print("  1. Run: python main.py")
        print("  2. Open: http://localhost:8000/docs")
        print()
    else:
        print("❌ SOME DEPENDENCIES MISSING")
        print()
        print("Please run: pip install -r requirements.txt")
        print()
    
    print("="*60)
    return all_good


def check_file_structure():
    """Verify project structure"""
    import os
    
    print()
    print("="*60)
    print("VERIFICATION: Checking Project Structure")
    print("="*60)
    print()
    
    required_files = [
        "main.py",
        "requirements.txt",
        "models/schemas.py",
        "services/image_service.py",
        "services/fraud_detection_service.py",
        "services/decision_engine.py",
        "utils/storage.py",
    ]
    
    all_good = True
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file:40} - Found")
        else:
            print(f"❌ {file:40} - Missing")
            all_good = False
    
    print()
    print("="*60)
    
    if all_good:
        print("✅ ALL FILES PRESENT!")
    else:
        print("❌ SOME FILES MISSING")
    
    print("="*60)
    return all_good


def main():
    """Run all verification checks"""
    print("\n" + "🚀"*30)
    print("RETURN PRODUCT FRAUD DETECTION - VERIFICATION")
    print("🚀"*30 + "\n")
    
    deps_ok = check_imports()
    files_ok = check_file_structure()
    
    print()
    print("="*60)
    print("FINAL STATUS")
    print("="*60)
    
    if deps_ok and files_ok:
        print()
        print("🎉 ALL CHECKS PASSED! YOU'RE READY TO GO!")
        print()
        print("Next steps:")
        print("  1. Start server: python main.py")
        print("  2. Open browser: http://localhost:8000/docs")
        print("  3. Run tests: python test_api.py")
        print()
        print("Good luck with your demo! 🚀")
        print()
    else:
        print()
        print("⚠️  SOME CHECKS FAILED")
        print()
        print("Please fix the issues above before running the server.")
        print()
    
    print("="*60)


if __name__ == "__main__":
    main()
