import os
from flask import Flask, request, jsonify, send_from_directory
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='')

TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY')

if not TMDB_API_KEY or not YOUTUBE_API_KEY:
    raise ValueError("TMDB_API_KEY and YOUTUBE_API_KEY must be set in environment variables")

TMDB_BASE_URL = 'https://api.themoviedb.org/3'
YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3'


def get_content_details(content_id, content_type):
    url = f"{TMDB_BASE_URL}/{content_type}/{content_id}"
    params = {
        'api_key': TMDB_API_KEY,
        'append_to_response': 'videos,watch/providers'
    }
    response = requests.get(url, params=params)
    data = response.json()

    # Extract relevant information
    title = data.get('title') or data.get('name')
    poster_path = data.get('poster_path')
    imdb_rating = data.get('vote_average')
    
    # Get languages
    languages = [lang['english_name'] for lang in data.get('spoken_languages', [])]

    # Get available platforms
    providers = data.get('watch/providers', {}).get('results', {}).get('US', {})
    platforms = providers.get('flatrate', []) + providers.get('buy', [])
    platform_names = [p['provider_name'] for p in platforms]

    # Get YouTube trailer
    trailer = None
    videos = data.get('videos', {}).get('results', [])
    for video in videos:
        if video['site'] == 'YouTube' and video['type'] == 'Trailer':
            trailer = f"https://www.youtube.com/watch?v={video['key']}"
            break

    return {
        'title': title,
        'poster': f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None,
        'type': content_type.capitalize(),
        'imdb_rating': imdb_rating,
        'platforms': platform_names,
        'languages': languages,
        'trailer': trailer
    }

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    # Search for movies, TV shows, and anime
    search_url = f"{TMDB_BASE_URL}/search/multi"
    params = {
        'api_key': TMDB_API_KEY,
        'query': query,
        'page': 1
    }
    response = requests.get(search_url, params=params)
    data = response.json()

    results = []
    for item in data.get('results', [])[:12]:  # Number of Content display 
        content_type = 'movie' if item['media_type'] == 'movie' else 'tv'
        content_details = get_content_details(item['id'], content_type)
        if content_details:  # Only add non-null results
            results.append(content_details)

    return jsonify(results)

@app.route('/recommendations', methods=['GET'])
def recommendations():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    # For simplicity, we'll use the search endpoint to get recommendations
    # In a real-world scenario, you might want to implement a more sophisticated recommendation system
    return search()

if __name__ == '__main__':
    app.run(debug=True)


