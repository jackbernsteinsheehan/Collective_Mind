from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from firebase_admin import firestore

from firebase_client import initialize_firebase

try:
    from backend.get_chat_suggestions import (
        get_argument_suggestions,
        get_debate_tips,
    )
    from backend.matchmaking import find_best_opposing_match
    
except ImportError:
    get_argument_suggestions = None
    get_debate_tips = None

# Initialize flask
app = Flask(__name__)
CORS(app)


# Get firebase client
db = initialize_firebase()


# ___ Endpoints ___ #

@app.route('/api/users/create', methods=['POST'])
def create_user():
    """Create a new user when they sign up"""
    try:
        data = request.get_json()
        email = data.get('email')
        username = data.get('username')
        
        if not email or not username:
            return jsonify({'error': 'Email and username required'}), 400
        
        # Generate user ID
        user_id = f"user_{int(datetime.now().timestamp())}"
        
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

@app.route('/api/debate/join', methods=['POST'])
def join_debate():
    """Handle the complete debate joining flow"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        debate_topic = data.get('debate_topic')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Check if user exists and has completed survey
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = user_doc.to_dict()
        
        if not user_data.get('survey_completed'):
            return jsonify({'error': 'Survey not completed'}), 400
        
        if user_data.get('status') == 'in_chat':
            return jsonify({'error': 'User already in a chat'}), 400
        
        print(f"User {user_id} wants to join debate: {debate_topic}")
        
        available_users = db.collection('users').where(
            'status', '==', 'available'
        ).where(
            'survey_completed', '==', True
        ).stream()

        candidates = [candidate.to_dict() for candidate in available_users]
        best_match = find_best_opposing_match(
            current_user=user_data,
            candidates=candidates,
            debate_topic=debate_topic,
            excluded_user_ids={user_id},
        )

        if not best_match:
            print(f"No partner found for user {user_id}")
            return jsonify({
                'success': False,
                'message': 'No suitable partner found. You\'ll be notified when someone joins.'
            }), 200

        potential_partner_data = best_match['user']
        partner_id = potential_partner_data.get('user_id')
        print(
            f"Found partner: {partner_id} with score "
            f"{best_match['match_score']['score']}"
        )

        # Create chat session
        chat_ref = db.collection('chats').document()
        chat_ref.set({
            'user1_id': user_id,
            'user2_id': partner_id,
            'debate_topic': debate_topic,
            'created_at': firestore.SERVER_TIMESTAMP,
            'status': 'active',
            'match_score': best_match['match_score']['score'],
            'match_details': best_match['match_score'],
        })

        # Update both users to 'in_chat'
        user_ref.update({'status': 'in_chat'})
        db.collection('users').document(partner_id).update({'status': 'in_chat'})

        return jsonify({
            'success': True,
            'chat_id': chat_ref.id,
            'partner_id': partner_id,
            'partner_views': potential_partner_data.get('political_spectrum'),
            'match_score': best_match['match_score'],
            'message': f'Paired with someone who identifies as {potential_partner_data.get("political_spectrum")}'
        }), 200
            
    except Exception as e:
        print(f"Error in join_debate: {e}")
        return jsonify({'error': 'Failed to join debate'}), 500

@app.route('/api/debate/status', methods=['GET'])
def get_debate_status():
    """Get available debates and participant counts"""
    try:
        # Get counts for each debate topic
        topics = ['Climate Change', 'Universal Healthcare', 'Gun Control', 'Immigration']
        status_data = {}
        
        for topic in topics:
            # Count available users for this topic
            available_count = len(list(db.collection('users').where(
                'status', '==', 'available'
            ).where('survey_completed', '==', True).stream()))
            
            # Count active chats for this topic
            active_chats = len(list(db.collection('chats').where(
                'debate_topic', '==', topic
            ).where('status', '==', 'active').stream()))
            
            status_data[topic] = {
                'available_participants': available_count,
                'active_debates': active_chats,
                'total_participants': available_count + (active_chats * 2)
            }
        
        return jsonify(status_data), 200
        
    except Exception as e:
        print(f"Error getting debate status: {e}")
        return jsonify({'error': 'Failed to get debate status'}), 500

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
        chat_id = f"chat_{int(datetime.now().timestamp())}"

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
    """Update message logs for a specific room."""
    try:
        data = request.get_json()
        chat_ref = db.collection('chats').document(chat_id).collection('messages').document()
        chat_ref.set({
            'senderId': data.get('sender_id'),
            'text': data.get('message_content'),
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        return jsonify({'message': 'Message saved successfully'}), 200
    except Exception as e:
        print(f'error saving message: {e}')
        return jsonify({'error': 'Failed to save message'}), 500



# ___ OpenAI Endpoints ___ #
@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    """
    API endpoint to get argument suggestions
    """
    try:
        if get_argument_suggestions is None:
            return jsonify({
                'success': False,
                'error': 'Argument suggestions service is not configured'
            }), 503

        data = request.get_json()
        
        # Validate required fields
        if not data or 'argument' not in data or 'topic' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: argument and topic'
            }), 400
        
        argument = data['argument']
        topic = data['topic']
        user_views = data.get('user_views', None)
        
        # Get suggestions from OpenAI
        suggestions = get_argument_suggestions(argument, topic, user_views)
        
        return jsonify(suggestions)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/debate-tips', methods=['POST'])
def get_tips():
    """
    API endpoint to get debate tips
    """
    try:
        if get_debate_tips is None:
            return jsonify({
                'success': False,
                'error': 'Debate tips service is not configured'
            }), 503

        data = request.get_json()
        
        if not data or 'topic' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: topic'
            }), 400
        
        topic = data['topic']
        user_views = data.get('user_views', None)
        
        tips = get_debate_tips(topic, user_views)
        
        return jsonify(tips)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



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
