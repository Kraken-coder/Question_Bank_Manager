import os

GOOGLE_API_KEY = "AIzaSyD7rx81XWKCllmEfiBJRZ_81OZtt30bvqc"

# Database configuration with environment variable support
DB_CONFIG = {
    'dbname': os.getenv('DB_NAME', 'question_bank'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'diptanshu'),
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432))
}
