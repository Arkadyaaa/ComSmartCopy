from flask import Flask, jsonify, request
from flask_cors import CORS
from tos import generate_summative_assessment
import json
import traceback
import sys
import yt_dlp
app = Flask(__name__)
CORS(app)  

@app.route('/api/generate-summative-assessment', methods=['GET'])
def get_summative_assessment():
    """Generate and return summative assessment"""
    try:
        print("Starting assessment generation...", file=sys.stderr)
        assessment = generate_summative_assessment()
        print(f"Assessment generated with {len(assessment.get('questions', []))} questions", file=sys.stderr)
        
        if 'error' in assessment:
            print(f"Error in assessment: {assessment['error']}", file=sys.stderr)
            return jsonify(assessment), 500
        
        return jsonify(assessment), 200
    except Exception as e:
        error_msg = traceback.format_exc()
        print(f"EXCEPTION: {error_msg}", file=sys.stderr)
        sys.stderr.flush()
        return jsonify({
            'error': str(e),
            'message': 'Failed to generate assessment',
            'traceback': error_msg
        }), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.get_json(force=True)
        print("Incoming data:", data, file=sys.stderr)

        query = data.get("query", "Computer")
        limit = int(data.get("limit", 10))

        ydl_opts = {
            "quiet": True,
            "extract_flat": True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(
                f"ytsearch{limit}:{query}",
                download=False
            )

        videos = []
        for v in result.get("entries", []):
            videos.append({
                "id": v.get("id"),
                "title": v.get("title"),
                "url": f"https://www.youtube.com/watch?v={v.get('id')}",
                "channel": v.get("uploader"),
            })

        return jsonify({ "videos": videos }), 200

    except Exception as e:
        error_msg = traceback.format_exc()
        print(error_msg, file=sys.stderr)
        return jsonify({
            "error": str(e),
            "traceback": error_msg
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
