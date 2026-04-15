import os
from firebase_admin import credentials, firestore
import firebase_admin


def initialize_firebase():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    service_account_path = os.path.join(backend_dir, "serviceAccountKey.json")

    if not os.path.exists(service_account_path):
        print("ERROR: serviceAccountKey.json not found!")
        print("Please follow the setup instructions in backend/README.md")
        exit(1)

    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized successfully!")
    except Exception as e:
        print(f"ERROR initializing Firebase: {e}")
        exit(1)

    return firestore.client()
