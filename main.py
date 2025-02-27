from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

# Temporary storage (Replace with Firestore later)
players = []
matches = {}

@app.route('/')
def home():
    return render_template("index.html")  # Loads Frontend

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    players.append(data)
    return jsonify({"message": "Player registered!", "players": players})

@app.route('/match', methods=['GET'])
def match_players():
    if len(players) < 2:
        return jsonify({"message": "Not enough players to match."})

    p1, p2 = random.sample(players, 2)
    match_id = f"{p1['name']}_vs_{p2['name']}"
    matches[match_id] = (p1, p2)

    return jsonify({"match_id": match_id, "player1": p1, "player2": p2})

@app.route('/rate', methods=['POST'])
def rate():
    data = request.get_json()
    match_id = data['match_id']
    rating = data['rating']
    return jsonify({"message": f"Rating submitted for {match_id}", "rating": rating})

if __name__ == '__main__':
    app.run(debug=True)
