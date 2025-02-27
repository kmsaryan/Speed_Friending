from flask import Flask, render_template, request, jsonify, current_app
from flask_cors import CORS
import random
import time
from database.database import db, setup_database, Player, Match, Rating  # Import database setup
from celery_app import make_celery

# Initialize Flask app
app = Flask(__name__, static_folder='static', template_folder='templates')
app.config.from_object('config.Config')
setup_database(app)  # Set up database before running the app

CORS(app)

# Initialize Celery
celery = make_celery(app)

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
    try:
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
        return jsonify({"message": "Player registered!", "redirect": "/player"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

def attempt_match():
    available_players = Player.query.filter_by(matched=False, stationary=False).all()
    stationary_opponents = Player.query.filter_by(matched=False, stationary=True).all()

    print(f"Available players: {[p.name for p in available_players]}")
    print(f"Stationary players: {[p.name for p in stationary_opponents]}")

    if not available_players and not stationary_opponents:
        print("No available players for matching.")
        return  

    # Ensure matching happens correctly
    while len(available_players) >= 2:  
        player1 = available_players.pop(0)
        player2 = available_players.pop(0)

        challenge = random.choice(challenges)
        match = Match(player1=player1.name, player2=player2.name, challenge=challenge)
        db.session.add(match)

        player1.matched = True
        player2.matched = True
        db.session.commit()

        print(f"Created match: {player1.name} vs {player2.name}")

        match_timer.delay(match.id)

    # Pair remaining available players with stationary opponents
    while stationary_opponents and available_players:
        player1 = available_players.pop(0)
        opponent = stationary_opponents.pop(0)

        challenge = random.choice(challenges)
        match = Match(player1=player1.name, player2=opponent.name, challenge=challenge)
        db.session.add(match)

        player1.matched = True
        opponent.matched = True
        db.session.commit()

        print(f"Created match: {player1.name} vs {opponent.name}")

        match_timer.delay(match.id)

@app.route('/match_status/<player_name>')
def match_status(player_name):
    match = Match.query.filter(
        (Match.player1 == player_name) | (Match.player2 == player_name)
    ).first()

    if match:
        if match.player1 == player_name:
            opponent_name = match.player2
        else:
            opponent_name = match.player1

        return jsonify({
            "match_id": match.id,
            "player1": match.player1,
            "player2": match.player2,
            "opponent": opponent_name,
            "challenge": match.challenge
        })
    else:
        return jsonify({"error": "No match found"}), 404

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

@celery.task
def match_timer(match_id):
    time.sleep(60)  # Wait for match duration
    match = Match.query.get(match_id)
    if match:
        db.session.delete(match)
        db.session.commit()
    print(f"Match {match_id} expired.")

if __name__ == '__main__':
    app.run(debug=True)