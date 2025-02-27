from flask import Flask, render_template, request, jsonify
from flask_cors import CORS  # Import CORS
import random

app = Flask(__name__)
CORS(app)  # Allow all origins

players = []
matches = {}

@app.route('/')
def home():
    return "Flask Backend is Running!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    players.append(data)
    return jsonify({"message": "Player registered!", "players": players})

if __name__ == '__main__':
    app.run(debug=True)
