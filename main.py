from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import random
import threading
import time

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

players_queue = []  
stationary_opponents = []  
matches = {}  
ratings = {}  
challenges = [
    "Describe a unique holiday in your country!",
    "What's a traditional dish from your culture?",
    "Teach your opponent a greeting in your language!",
    "Share an interesting myth or legend from your culture!",
    "Explain a local custom that people might not know about!"
]

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
        "stationary": data.get("stationary", False),
        "matched": False
    }
    
    if player["stationary"]:
        stationary_opponents.append(player)
    else:
        players_queue.append(player)
    
    attempt_match()

    return jsonify({"message": "Player registered!", "redirect": "/player"})

def attempt_match():
    while len(players_queue) >= 1 or len(stationary_opponents) >= 1:
        if len(players_queue) < 1 and len(stationary_opponents) < 1:
            return  

        player = players_queue.pop(0) if players_queue else None

        if stationary_opponents:
            opponent = stationary_opponents.pop(0)
        elif players_queue:
            opponent = players_queue.pop(0)
        else:
            return  

        match_id = f"{player['name']}_vs_{opponent['name']}"
        challenge = random.choice(challenges)
        matches[match_id] = {
            "player": player,
            "opponent": opponent,
            "challenge": challenge,
            "time": 60
        }
        
        player["matched"] = True
        opponent["matched"] = True
        
        threading.Thread(target=match_timer, args=(match_id,)).start()

@app.route('/match_status/<player_name>', methods=['GET'])
def match_status(player_name):
    for match_id, match_data in matches.items():
        if match_data["player"]["name"] == player_name or match_data["opponent"]["name"] == player_name:
            return jsonify({
                "matched": True,
                "match_id": match_id,
                "opponent": match_data["opponent"] if match_data["player"]["name"] == player_name else match_data["player"],
                "challenge": match_data["challenge"]
            })

    return jsonify({"matched": False})

def match_timer(match_id):
    time.sleep(60)  
    
    if match_id in matches:
        del matches[match_id]  

@app.route('/rate', methods=['POST'])
def rate():
    data = request.get_json()
    match_id = data['match_id']
    rating = data['rating']
    
    if match_id not in matches:
        return jsonify({"message": "Invalid match ID"}), 400
    
    ratings[match_id] = rating  
    return jsonify({"message": "Rating submitted!"})

@app.route('/history', methods=['GET'])
def history():
    return jsonify({"history": ratings})

@app.route('/player')
def player_page():
    return render_template('player.html')

@app.route('/opponent')
def opponent_page():
    return render_template('opponent.html')

if __name__ == '__main__':
    app.run(debug=True)
