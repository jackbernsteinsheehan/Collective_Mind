import os
from firebase_admin import credentials, firestore
import firebase_admin
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))
service_account_path = os.path.join(current_dir, "serviceAccountKey.json")

# Check if service account key exists
if not os.path.exists(service_account_path):
    print("ERROR: serviceAccountKey.json not found!")
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

@app.route('/api/survey', methods=['POST'])
def submit_survey():
    """Store survey data in Firebase"""
    try:
        data = request.get_json()
        
        # Store in 'surveys' collection
        survey_ref = db.collection('surveys').document()
        survey_ref.set({
            'user_id': data.get('user_id', 'anonymous'),  # Default if no user_id
            'political_spectrum': data.get('political_spectrum'),
            'economic_views': data.get('economic_views'),
            'social_views': data.get('social_views'),
            'timestamp': firestore.SERVER_TIMESTAMP,
            'status': 'available'  # Ready for pairing
        })
        
        print(f"Stored survey data: {data}")
        return jsonify({'message': 'Survey stored successfully'}), 200
        
    except Exception as e:
        print(f"Error storing survey: {e}")
        return jsonify({'error': 'Failed to store survey'}), 500

@app.route('/api/survey', methods=['GET'])
def get_surveys():
    """Get all survey responses"""
    try:
        surveys_ref = db.collection('surveys')
        docs = surveys_ref.stream()
        
        surveys = []
        for doc in docs:
            survey_data = doc.to_dict()
            surveys.append({
                'id': doc.id,
                'user_id': survey_data.get('user_id'),
                'political_spectrum': survey_data.get('political_spectrum'),
                'economic_views': survey_data.get('economic_views'),
                'social_views': survey_data.get('social_views'),
                'status': survey_data.get('status'),
                'timestamp': survey_data.get('timestamp')
            })
        
        return jsonify({'surveys': surveys}), 200
        
    except Exception as e:
        print(f"Error retrieving surveys: {e}")
        return jsonify({'error': 'Failed to retrieve surveys'}), 500

@app.route('/api/chat/find-partner', methods=['POST'])
def find_chat_partner():
    """Find user with opposite political views"""
    try:
        data = request.get_json()
        current_user_id = data.get('user_id')
        
        # Get current user's political views
        current_user_query = db.collection('surveys').where('user_id', '==', current_user_id).limit(1)
        current_user_docs = current_user_query.stream()
        
        current_user_data = None
        for doc in current_user_docs:
            current_user_data = doc.to_dict()
            break
        
        if not current_user_data:
            return jsonify({'error': 'User not found'}), 404
        
        current_political = current_user_data.get('political_spectrum')
        
        # Define opposite views mapping
        opposite_views = {
            'far_left': ['far_right', 'right'],
            'left': ['right', 'far_right'],
            'center_left': ['center_right', 'right'],
            'center': ['far_left', 'far_right', 'left', 'right'],
            'center_right': ['center_left', 'left'],
            'right': ['left', 'far_left'],
            'far_right': ['far_left', 'left']
        }
        
        # Find users with opposite views who are available
        target_views = opposite_views.get(current_political, [])
        
        for view in target_views:
            available_users_query = db.collection('surveys').where(
                'political_spectrum', '==', view
            ).where('status', '==', 'available').limit(1)
            
            available_users = available_users_query.stream()
            
            for user in available_users:
                user_data = user.to_dict()
                if user_data.get('user_id') != current_user_id:
                    # Found a match!
                    return jsonify({
                        'partner_id': user_data.get('user_id'),
                        'partner_views': user_data.get('political_spectrum')
                    }), 200
        
        return jsonify({'message': 'No suitable partner found'}), 404
        
    except Exception as e:
        print(f"Error finding partner: {e}")
        return jsonify({'error': 'Failed to find partner'}), 500

@app.route('/api/chat/create', methods=['POST'])
def create_chat():
    """Create chat between matched users"""
    try:
        data = request.get_json()
        user1_id = data.get('user1_id')
        user2_id = data.get('user2_id')
        
        # Create chat
        chat_ref = db.collection('chats').document()
        chat_ref.set({
            'user1_id': user1_id,
            'user2_id': user2_id,
            'created_at': firestore.SERVER_TIMESTAMP,
            'status': 'active'
        })
        
        # Update both users to 'in_chat'
        # Find and update user1
        user1_query = db.collection('surveys').where('user_id', '==', user1_id)
        user1_docs = user1_query.stream()
        for doc in user1_docs:
            doc.reference.update({'status': 'in_chat'})
            break
        
        # Find and update user2
        user2_query = db.collection('surveys').where('user_id', '==', user2_id)
        user2_docs = user2_query.stream()
        for doc in user2_docs:
            doc.reference.update({'status': 'in_chat'})
            break
        
        return jsonify({'chat_id': chat_ref.id, 'message': 'Chat created successfully'}), 200
        
    except Exception as e:
        print(f"Error creating chat: {e}")
        return jsonify({'error': 'Failed to create chat'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Firebase API is running'}), 200

if __name__ == '__main__':
    print("Starting Firebase Survey & Chat API...")
    print("Available endpoints:")
    print("  POST /api/survey - Submit survey data")
    print("  GET  /api/survey - Get all surveys")
    print("  POST /api/chat/find-partner - Find chat partner")
    print("  POST /api/chat/create - Create chat session")
    print("  GET  /health - Health check")
    app.run(debug=True, host='0.0.0.0', port=5000) 