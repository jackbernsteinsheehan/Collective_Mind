import os
from firebase_admin import credentials, firestore
import firebase_admin
from datetime import datetime
from flask import jsonify, request


class Connection():
    def __init__(self):

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
            # Get Firestore database
            self.db = firestore.client()
            
            self.cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(self.cred)
            print("Firebase initialized successfully!")

        except Exception as e:
            print(f"ERROR initializing Firebase: {e}")
            exit(1)

    def __create_id(self):
        datetime = int(datetime.now().timestamp())
        random = random.randint(0, 10000)
        user_id = f'user_id {datetime + random}'
        return user_id

    def create_user(self, data):
        '''Create a new user document when they sign up'''
        user_id = self.__create_id

        try:
            email = data.get('email')
            username = data.get('username')

            if not email or not username:
                return jsonify({'error': 'Email and username required'}), 400
            
            # Make a new user doc
            user_ref = self.db.collection('users').document(user_id)
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

    def update_user_survey(self, user_id, data):
        '''Update user doc with their new survey data. Send data from the corresponding endpoint.
        '''
        try:
            # Update user doc with their survey data
            user_ref = self.db.collection('users').document(user_id)
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
        
        except Exception as error:
            print(f"Error updating user survey: {e}")
            return jsonify({'error': 'Failed to update survey data'}), 500
    def create_chat_room(self, user1_id, user2_id):
        try:
            chat_id = self.make_id()

            data = request.get_json()
            chat_ref = self.db.collection('chats').document(chat_id)
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

db = Connection()