from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

players = []
matches = {}

@app.route('/')
def home():
    return render_template('index.html')  # Serve the frontend

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    players.append(data)
    return jsonify({"message": "Player registered!", "players": players})

if __name__ == '__main__':
    app.run(debug=True)
