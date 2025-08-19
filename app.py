from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Change this to a strong secret key
CORS(app)

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['voting_db']
users_collection = db['users']
candidates_collection = db['candidates']
votes_collection = db['votes']

# ------------------------------
# 🏠 Home/Login Page
@app.route('/')
def home():
    return render_template('index.html')

# ------------------------------
# 📋 Dashboard Page (after login)
@app.route('/dashboard')
def user_dashboard():
    if 'voterId' not in session:
        return redirect(url_for('home'))
    return render_template('dashboard.html', fullName=session.get('fullName'))

# ------------------------------
# 👥 Get All Candidates
@app.route('/candidates', methods=['GET'])
def get_candidates():
    candidates = list(candidates_collection.find({}, {'_id': 1, 'name': 1}))
    candidate_list = [{'id': str(c['_id']), 'name': c['name']} for c in candidates]
    return jsonify({'status': 'success', 'candidates': candidate_list})

# ------------------------------
# 🗳️ Submit Vote
@app.route('/submit-vote', methods=['POST'])
def submit_vote():
    if 'voterId' not in session:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401

    data = request.get_json()
    candidate_name = data.get('candidate')
    voter_id = session.get('voterId')

    if not candidate_name:
        return jsonify({'success': False, 'message': 'No candidate selected'}), 400

    # Check if user has already voted (by voterId)
    existing_vote = votes_collection.find_one({'voterId': voter_id})
    if existing_vote:
        return jsonify({'success': False, 'message': 'You have already voted'}), 403

    # Optional: Check if candidate exists in database
    if not candidates_collection.find_one({'name': candidate_name}):
        return jsonify({'success': False, 'message': 'Invalid candidate'}), 400

    vote_doc = {
        'voterId': voter_id,
        'candidate': candidate_name,
        'timestamp': datetime.utcnow()
    }

    votes_collection.insert_one(vote_doc)
    return jsonify({'success': True, 'message': f'You have successfully voted for {candidate_name}.'})


# ------------------------------


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    # JS needs a JSON response or status, not redirect
    return '', 204  # No Content


# ------------------------------
# 📝 Registration Page
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')

    if request.method == 'POST':
        data = request.get_json()
        required_fields = ['fullName', 'voterId', 'email', 'password']

        if not data or not all(field in data and data[field] for field in required_fields):
            return jsonify({'status': 'error', 'message': 'Please fill all required fields.'}), 400

        voter_id = data.get('voterId')

        if users_collection.find_one({'voterId': voter_id}):
            return jsonify({'status': 'error', 'message': 'Voter ID already exists'}), 409

        user = {
            'fullName': data.get('fullName'),
            'voterId': voter_id,
            'email': data.get('email'),
            'password': generate_password_hash(data.get('password'))
        }

        users_collection.insert_one(user)
        return jsonify({'status': 'success', 'message': 'Registration successful'})

# ------------------------------
# 🔐 Login Handling
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('voterId') or not data.get('password'):
        return jsonify({'status': 'error', 'message': 'Missing voter ID or password'}), 400

    voter_id = data.get('voterId')
    password = data.get('password')

    user = users_collection.find_one({'voterId': voter_id})
    if user and check_password_hash(user['password'], password):
        session['voterId'] = voter_id
        session['fullName'] = user['fullName']
        return jsonify({'status': 'success', 'message': 'Login successful'})
    else:
        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

# ------------------------------
# 🔁 Handle 404 errors
@app.errorhandler(404)
def not_found(e):
    return redirect(url_for('home'))

# ------------------------------
# ▶️ Run the app
if __name__ == '__main__':
    app.run(debug=True)
