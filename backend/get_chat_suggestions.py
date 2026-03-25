import requests
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_argument_suggestions(user_argument, topic, user_political_views=None):
    """
    Get suggestions to improve a user's argument using ChatGPT.
    
    Args:
        user_argument (str): The user's current argument
        topic (str): The debate topic
        user_political_views (dict): User's political views from survey
    
    Returns:
        dict: Suggestions for improving the argument
    """
    try:
        # Create context about the user's views if available
        context = ""
        if user_political_views:
            context = f"""
            User's political profile:
            - Political spectrum: {user_political_views.get('political_spectrum', 'Not specified')}
            - Economic views: {user_political_views.get('economic_views', 'Not specified')}
            - Social views: {user_political_views.get('social_views', 'Not specified')}
            """

        system_prompt = f"""You are a debate coach helping users improve their arguments. 
        Your goal is to make arguments more persuasive, well-structured, and respectful while maintaining the user's core position.
        
        {context}
        
        Provide suggestions in the following format:
        1. Structure improvements
        2. Evidence suggestions
        3. Rhetorical improvements
        4. Counter-argument preparation
        5. Tone adjustments (if needed)
        
        Keep suggestions constructive and actionable. Focus on making the argument stronger, not changing the user's position."""

        user_prompt = f"""Topic: {topic}

User's current argument: "{user_argument}"

Please provide specific suggestions to improve this argument. Focus on:
- Making it more persuasive
- Adding structure and clarity
- Suggesting relevant evidence or examples
- Improving the tone for constructive debate
- Preparing for potential counter-arguments

Format your response as a JSON object with these keys:
{{
    "structure_suggestions": ["suggestion1", "suggestion2"],
    "evidence_suggestions": ["evidence1", "evidence2"],
    "rhetorical_improvements": ["improvement1", "improvement2"],
    "counter_argument_prep": ["prep1", "prep2"],
    "tone_adjustments": ["adjustment1", "adjustment2"],
    "improved_argument": "A suggested improved version of the argument"
}}"""

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Parse the response
        suggestions_text = response.choices[0].message.content
        
        # Try to parse as JSON, fallback to text if it fails
        try:
            import json
            suggestions = json.loads(suggestions_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw text
            suggestions = {
                "raw_suggestions": suggestions_text,
                "error": "Could not parse structured suggestions"
            }

        return {
            "success": True,
            "suggestions": suggestions,
            "original_argument": user_argument,
            "topic": topic
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "original_argument": user_argument,
            "topic": topic
        }

def get_debate_tips(topic, user_views=None):
    """
    Get general debate tips for a specific topic.
    """
    try:
        context = ""
        if user_views:
            context = f"User's views: {user_views}"

        system_prompt = """You are a debate coach providing tips for constructive dialogue. 
        Focus on techniques that promote understanding and respectful disagreement."""

        user_prompt = f"""Topic: {topic}
        {context}
        
        Provide 3-5 specific debate tips for this topic that would help users engage more effectively."""

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return {
            "success": True,
            "tips": response.choices[0].message.content,
            "topic": topic
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "topic": topic
        }

# Example usage
if __name__ == "__main__":
    # Test the function
    test_argument = "Climate change is real and we need to do something about it."
    test_topic = "Climate Change: Is it primarily caused by human activity?"
    test_views = {
        "political_spectrum": "center",
        "economic_views": "moderate",
        "social_views": "moderate"
    }
    
    suggestions = get_argument_suggestions(test_argument, test_topic, test_views)
    print("Argument Suggestions:")
    print(suggestions)
    
    tips = get_debate_tips(test_topic, test_views)
    print("\nDebate Tips:")
    print(tips)