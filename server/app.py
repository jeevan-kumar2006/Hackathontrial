from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import re

app = Flask(__name__)
CORS(app) # Allows frontend to talk to backend

# --- Database Setup ---
DB_NAME = 'users.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- Helper Functions for "AI" Logic ---

def analyze_text_logic(text):
    words = text.split()
    word_count = len(words)
    total_chars = sum(len(word) for word in words)
    avg_word_length = total_chars / word_count if word_count > 0 else 0
    
    sentences = re.split(r'[.!?]+', text)
    avg_sentence_length = word_count / len(sentences) if len(sentences) > 1 else word_count

    # Determine complexity
    complexity = "Standard"
    if avg_word_length > 6: complexity = "Academic/Complex"
    elif avg_word_length < 4: complexity = "Simple"

    # Recommendation Logic
        recommendation = "Content is lengthy and dense. ADHD Focus Mode recommended."
        mode = "adhd"
    elif avg_word_length > 6:
        recommendation = "High vocabulary density. Dyslexia Mode recommended."
        mode = "dyslexia"
    else:
        recommendation = "Standard content."
        mode = "default"

    return {
        "wordCount": word_count,
        "avgWordLength": round(avg_word_length, 1),
        "avgSentenceLength": round(avg_sentence_length, 1),
        "complexity": complexity,
        "recommendation": recommendation,
        "recommendedMode": mode
    }

def simplify_text_logic(text):
    # Mock AI: Extracts the first sentence of every paragraph
    paragraphs = text.split('\n\n')
    summary_points = []
    for p in paragraphs:
        if p.strip():
            # Grab first sentence
            first_sentence = re.split(r'[.!?]', p)[0]
            summary_points.append(first_sentence + ".")
    
    return {
        "summary": summary_points,
        "original": text
    }

# --- Routes ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({"success": True, "message": "Login successful"})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "User created"})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "User already exists"}), 400

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '')
    result = analyze_text_logic(text)
    return jsonify(result)

@app.route('/api/simplify', methods=['POST'])
def simplify():
    data = request.json
    text = data.get('text', '')
    result = simplify_text_logic(text)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
