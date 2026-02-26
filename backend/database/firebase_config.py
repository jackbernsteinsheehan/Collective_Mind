import os
from firebase_admin import credentials, firestore
import firebase_admin
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random
from Connection import Connection

def make_id():
    datetime = int(datetime.now().timestamp())
    random = random.randint(0, 10000)
    user_id = f'user_id {datetime + random}'
    return user_id

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))
# Go up one level to backend/ directory where serviceAccountKey.json is located
backend_dir = os.path.dirname(current_dir)
service_account_path = os.path.join(backend_dir, "serviceAccountKey.json")

# Debug: print the path being checked
print(f"DEBUG: Looking for serviceAccountKey.json at: {service_account_path}")
print(f"DEBUG: File exists: {os.path.exists(service_account_path)}")

# Check if service account key exists
if not os.path.exists(service_account_path):
    print("ERROR: serviceAccountKey.json not found!")
    print(f"DEBUG: Searched at: {service_account_path}")
    print("Please follow the setup instructions in backend/README.md")
    exit(1)

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
    print("Firebase initialized successfully!")

except Exception as e:
    print(f"ERROR initializing Firebase: {e}")
    exit(1)

# Get Firestore database
db = firestore.client()

app = Flask(__name__)
CORS(app)

@app.route('/api/users/create', methods=['POST'])
def create_user():
    """Create a new user when they sign up"""
    try:
        data = request.get_json()
        # Send data to Connection method

        email = data.get('email')
        username = data.get('username')
        
        if not email or not username:
            return jsonify({'error': 'Email and username required'}), 400
        
        # Generate user ID
        user_id = make_id()
        
        # Create user document
        user_ref = db.collection('users').document(user_id)
        user_ref.set({
            'user_id': user_id,
            'email': email,
            'username': username,
            'created_at': firestore.SERVER_TIMESTAMP,
            'survey_completed': False,
            'status': 'inactive'
        })
        
        print(f"Created new user: {user_id}")
        return jsonify({
            'user_id': user_id,
            'message': 'User created successfully'
        }), 200
        
    except Exception as e:
        print(f"Error creating user: {e}")
        return jsonify({'error': 'Failed to create user'}), 500

@app.route('/api/users/<user_id>/survey', methods=['POST'])
def update_user_survey(user_id):
    """Update user with survey data when they complete the survey"""
    try:
        data = request.get_json()
        
        # Update user document with survey data
        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'political_spectrum': data.get('political_spectrum'),
            'economic_views': data.get('economic_views'),
            'social_views': data.get('social_views'),
            'survey_completed': True,
            'survey_completed_at': firestore.SERVER_TIMESTAMP,
            'status': 'available'  # Now available for pairing
        })
        
        print(f"Updated user {user_id} with survey data")
        return jsonify({'message': 'Survey data updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating user survey: {e}")
        return jsonify({'error': 'Failed to update survey data'}), 500

@app.route('/api/update/<user_id>/immigration/views', methods=['POST'])
def update_immigration_views(user_id):
    try:
        data = request.get_json(silent=True) or {}
        # DO NOT overwrite the path param user_id
        required = ['healthy_society', 'immigrant_children', 'healthy_economy']
        missing = [k for k in required if data.get(k) is None]
        if missing:
            return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

        user_ref = db.collection('users').document(user_id)
        # set(..., merge=True) works even if the doc doesn't exist yet
        user_ref.set({
            'healthy_society': data['healthy_society'],
            'immigrant_children': data['immigrant_children'],
            'healthy_economy': data['healthy_economy'],
            'immigration_completed': True,
            'immigration_completed_at': firestore.SERVER_TIMESTAMP,
            'status': 'available',
        }, merge=True)

        print(f"[immigration/views] Updated user {user_id} with {data}")
        return jsonify({'ok': True, 'user_id': user_id}), 200

    except Exception as e:
        print(f"Error updating immigration views: {e}")
        return jsonify({'error': 'Failed to update immigration views'}), 500


# Endpoint for creating a new chat room
# TODO: add functioality for changing activity status
@app.route('/api/create/room/<user1_id>/<user2_id>', methods=['POST'])
def create_chat_room(user1_id, user2_id):
    try:
        # Generate chat id
        chat_id = make_id()

        data = request.get_json()
        chat_ref = db.collection('chats').document(chat_id)
        chat_ref.set({
            'user1_id': user1_id,
            'user2_id': user2_id,
            'created_at': firestore.SERVER_TIMESTAMP,
            'status': 'active'
        })
        print(f'created new chat room: {chat_id}')
        return jsonify({
            'chat_id': chat_id,
            'message': 'chat room created successfully'
        }), 200

    except Exception as e:
        print(f'error creating chat room: {e}')
        return jsonify({'error': 'Failed to create chat room'}), 500

# ENDPOINT FOR UPDATING MESSAGE HISTORY
@app.route('/api/update/<chat_id>/messages', methods=['POST'])
def update_chat_messages(chat_id):
    '''Update message logs for a specific room. Body should include sender_id and message_content'''
    try:
        # generate message_id
        message_id = make_id()

        data = request.get_json()
        # add message to database
        chat_ref = db.collection('chats').document(chat_id).collection('messages').document(chat_id)
        chat_ref.update({
            'senderId': data.get('sender_id'),
            'text': data.get('message_content'),
            'timestamp': firestore.SERVER_TIMESTAMP
        })
    except Exception as e:
        print(f'error saving message')
        return jsonify({'error': 'Failed to save message'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Firebase API is running'}), 200

if __name__ == '__main__':
    print("Starting Firebase Survey & Chat API...")
    print("Available endpoints:")
    print("  POST /api/users/create - Create new user")
    print("  POST /api/users/<id>/survey - Update user with survey data")
    print("  POST /api/debate/join - Join debate with partner matching")
    print("  GET  /api/debate/status - Get debate status")
    print("  GET  /health - Health check")
    app.run(debug=True, host='0.0.0.0', port=5000) 