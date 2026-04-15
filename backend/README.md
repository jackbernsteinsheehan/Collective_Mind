# Backend Setup

## Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Rename it to `serviceAccountKey.json`
7. Place it in the `backend/` folder

## Installation

```bash
pip install firebase-admin flask flask-cors
```

## Running the server

```bash
python3 backend/firebase/endpoints.py
```

The server will run on `http://localhost:5000` 
