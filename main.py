from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import random
import threading
import time
from database.database import db, setup_database, Player, Match, Rating  # Import database setup

app = Flask(__name__, static_folder='static', template_folder='templates')
setup_database(app)  # Set up database before running the app

CORS(app)
# ----------------- CHALLENGES -----------------
challenges = [
    "Describe a unique holiday in your country!",
    "What's a traditional dish from your culture?",
    "Teach your opponent a greeting in your language!",
    "Share an interesting myth or legend from your culture!",
    "Explain a local custom that people might not know about!"
]

# ----------------- ROUTES -----------------
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    new_player = Player(
        name=data['name'],
        age=data.get('age', 'Unknown'),
        interests=','.join(data.get('interests', [])),
        stationary=data.get('stationary', False),
        matched=False
    )
    db.session.add(new_player)
    db.session.commit()

    attempt_match()
    return jsonify({"message": "Player registered!", "redirect": "/player"})

def attempt_match():
    available_players = Player.query.filter_by(matched=False, stationary=False).all()
    stationary_opponents = Player.query.filter_by(matched=False, stationary=True).all()

    if not available_players and not stationary_opponents:
        return  

    while len(available_players) > 1:  # Ensure pairing works for multiple players
        player1 = available_players.pop(0)
        opponent = available_players.pop(0)

        challenge = random.choice(challenges)
        match = Match(player1=player1.name, player2=opponent.name, challenge=challenge)
        db.session.add(match)

        player1.matched = True
        opponent.matched = True
        db.session.commit()

        threading.Thread(target=match_timer, args=(match.id,)).start()

    if stationary_opponents and available_players:
        player1 = available_players.pop(0)
        opponent = stationary_opponents.pop(0)

        challenge = random.choice(challenges)
        match = Match(player1=player1.name, player2=opponent.name, challenge=challenge)
        db.session.add(match)

        player1.matched = True
        opponent.matched = True
        db.session.commit()

        threading.Thread(target=match_timer, args=(match.id,)).start()


@app.route('/match_status/<player_name>', methods=['GET'])
def match_status(player_name):
    matches = Match.query.all()
    print("All Matches in DB:", matches)

    match = Match.query.filter(
        (Match.player1 == player_name) | (Match.player2 == player_name)
    ).order_by(Match.id.desc()).first()

    if match:
        opponent = match.player2 if match.player1 == player_name else match.player1
        return jsonify({
            "matched": True,
            "match_id": match.id,
            "opponent": opponent,
            "challenge": match.challenge
        })

    return jsonify({"matched": False})


def match_timer(match_id):
    time.sleep(60)  # Wait for 1 minutes
    match = Match.query.get(match_id)
    if match:
        match.completed = True
        db.session.commit()

@app.route('/rate', methods=['POST'])
def rate():
    data = request.get_json()
    match_id = data['match_id']
    rating_value = data['rating']

    match = Match.query.get(match_id)
    if not match:
        return jsonify({"message": "Invalid match ID"}), 400

    new_rating = Rating(match_id=match_id, rating=rating_value)
    db.session.add(new_rating)
    db.session.commit()
    
    return jsonify({"message": "Rating submitted!"})

@app.route('/history', methods=['GET'])
def history():
    ratings = Rating.query.all()
    history_data = [{"match_id": r.match_id, "rating": r.rating} for r in ratings]
    return jsonify({"history": history_data})

@app.route('/player')
def player_page():
    return render_template('player.html')

@app.route('/opponent')
def opponent_page():
    return render_template('opponent.html')

if __name__ == '__main__':
    app.run(debug=True)
