from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import random
import threading
import time

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

players_queue = []  # Players waiting to be matched
stationary_opponents = []  # Players who chose to remain stationary
matches = {}
ratings = {}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    player = {
        "name": data["name"],
        "age": data.get("age", "Unknown"),
        "interests": data.get("interests", []),
        "stationary": data.get("stationary", False)
    }
    
    if player["stationary"]:
        stationary_opponents.append(player)
    else:
        players_queue.append(player)
    
    return jsonify({"message": "Player registered! Waiting for a match."})

@app.route('/match', methods=['GET'])
def match_players():
    if len(players_queue) < 1 and len(stationary_opponents) < 1:
        return jsonify({"message": "No available players to match."})
    
    player = players_queue.pop(0) if players_queue else None
    
    if stationary_opponents:
        opponent = stationary_opponents.pop(0)
    elif players_queue:
        opponent = players_queue.pop(0)
    else:
        return jsonify({"message": "Waiting for more players."})
    
    match_id = f"{player['name']}_vs_{opponent['name']}"
    matches[match_id] = {"player": player, "opponent": opponent, "time": 60}  # 60 seconds match
    
    threading.Thread(target=match_timer, args=(match_id,)).start()
    
    return jsonify({"match_id": match_id, "player": player, "opponent": opponent})

def match_timer(match_id):
    time.sleep(60)  # 1-minute timer
    
    if match_id in matches:
        del matches[match_id]  # Remove expired match

@app.route('/rate', methods=['POST'])
def rate():
    data = request.get_json()
    match_id = data['match_id']
    rating = data['rating']
    
    if match_id not in matches:
        return jsonify({"message": "Invalid match ID"}), 400
    
    ratings[match_id] = rating  # Store anonymously
    return jsonify({"message": "Rating submitted!"})

@app.route('/history', methods=['GET'])
def history():
    return jsonify({"history": ratings})

if __name__ == '__main__':
    app.run(debug=True)
