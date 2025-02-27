web: gunicorn main:app
worker: celery -A main.celery worker --loglevel=info