import os
import sys
import uvicorn

# Ensure the root project directory is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if __name__ == "__main__":
    print("=" * 60)
    print("Starting Mtundu Cosmetics Python Backend...")
    print("API Docs: http://127.0.0.1:8000/docs")
    print("ReDoc:    http://127.0.0.1:8000/redoc")
    print("=" * 60)
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
