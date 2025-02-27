#database.py
#This file contains the database models and the function to initialize the database
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    age = db.Column(db.String(10))
    interests = db.Column(db.String(200))
    stationary = db.Column(db.Boolean, default=False)
    matched = db.Column(db.Boolean, default=False)

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player1 = db.Column(db.String(50), nullable=False)
    player2 = db.Column(db.String(50), nullable=False)
    challenge = db.Column(db.String(300), nullable=False)
    time_limit = db.Column(db.Integer, default=60)

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

def setup_database(app):
    """Initializes the database"""
    basedir = os.path.abspath(os.path.dirname(__file__))  # Get database folder path
    database_path = os.path.join(basedir, 'matchmaking.db')  # Place DB in the folder

    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{database_path}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
