#config.py
#This file contains the configuration for the Flask app
import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database/matchmaking.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_HEADERS = 'Content-Type'
    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'