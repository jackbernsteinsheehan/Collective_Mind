from flask import Flask, request, jsonify
from flask_cors import CORS
from get_chat_suggestions import get_argument_suggestions, get_debate_tips
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    """
    API endpoint to get argument suggestions
    """
    try:
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

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'message': 'Argument suggestions API is running'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port) 