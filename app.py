"""
Urlaubsplaner Mock Backend Server
Python Flask implementation that mimics the Spring Boot backend API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import bcrypt
import json
import os
from datetime import datetime, timedelta
from functools import wraps
import base64
import secrets

app = Flask(__name__)

# CORS Configuration - same as Java backend
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:8080",
            "file://"
        ],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
        "supports_credentials": True
    }
})

# JWT Configuration - same secret as Java backend
JWT_SECRET = base64.b64decode("cGFydGljdWxhcnZhbHVlcGVyZmVjdGx5dHJpY2tyZXA=").decode('utf-8')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MS = 9000000  # 2.5 hours in milliseconds

# Data file path
DATA_FILE = os.path.join(os.path.dirname(__file__), 'mock_backend', 'data.json')

# Initialize data structure
def load_data():
    """Load data from JSON file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "users": {},
        "auth": {},
        "tokens": {},
        "verification_codes": {},
        "next_user_id": 1,
        "next_auth_id": 1
    }

def save_data():
    """Save data to JSON file"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)

# Load initial data
data = load_data()

# Helper Functions
def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_access_token(auth_id):
    """Generate JWT access token"""
    expiration = datetime.utcnow() + timedelta(milliseconds=JWT_EXPIRATION_MS)
    payload = {
        'sub': str(auth_id),
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_refresh_token(auth_id):
    """Generate refresh token and store it"""
    refresh_token = secrets.token_urlsafe(32)
    expiration = datetime.utcnow() + timedelta(days=30)  # 30 days for refresh token

    data['tokens'][refresh_token] = {
        'authId': auth_id,
        'expireDate': expiration.isoformat()
    }
    save_data()

    return refresh_token

def validate_refresh_token(refresh_token):
    """Validate refresh token and return auth_id if valid"""
    if refresh_token not in data['tokens']:
        return None

    token_data = data['tokens'][refresh_token]
    expiration = datetime.fromisoformat(token_data['expireDate'])

    if datetime.utcnow() > expiration:
        del data['tokens'][refresh_token]
        save_data()
        return None

    return token_data['authId']

def require_auth(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Invalid token'}), 401

        token = auth_header[7:]  # Remove 'Bearer ' prefix

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            auth_id = int(payload['sub'])

            # Inject auth_id into kwargs
            kwargs['auth_id'] = auth_id
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

    return decorated_function

# ============================================================
# AUTH ENDPOINTS (Public)
# ============================================================

@app.route('/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        req_data = request.get_json()

        if not req_data or 'authData' not in req_data or 'personalData' not in req_data:
            return '', 400

        auth_data = req_data['authData']
        personal_data = req_data['personalData']

        email = auth_data.get('mail')
        password = auth_data.get('password')

        if not email or not password:
            return '', 400

        # Check if user already exists
        for auth_id, auth in data['auth'].items():
            if auth['email'] == email:
                return '', 400  # User already exists

        # Create auth entry
        auth_id = data['next_auth_id']
        data['next_auth_id'] += 1

        verification_code = secrets.token_urlsafe(16)

        data['auth'][str(auth_id)] = {
            'id': auth_id,
            'email': email,
            'password_hash': hash_password(password),
            'confirmed_at': None,
            'verification_code': verification_code
        }

        # Create user entry
        user_id = data['next_user_id']
        data['next_user_id'] += 1

        data['users'][str(auth_id)] = {
            'userId': user_id,
            'authId': auth_id,
            'firstName': personal_data.get('firstName'),
            'lastName': personal_data.get('lastName'),
            'birthDate': personal_data.get('birthDate'),
            'gender': personal_data.get('gender'),
            'avatarUrl': personal_data.get('avatarUrl'),
            'userName': personal_data.get('userName')
        }

        save_data()

        print(f"User registered: {email} (verification code: {verification_code})")

        return jsonify(True), 201

    except Exception as e:
        print(f"Registration error: {e}")
        return '', 500

@app.route('/auth/login', methods=['POST'])
def login():
    """Authenticate user and return tokens"""
    try:
        req_data = request.get_json()

        if not req_data:
            return '', 401

        email = req_data.get('mail')
        password = req_data.get('password')

        if not email or not password:
            return '', 401

        # Find user by email
        auth_id = None
        auth_entry = None

        for aid, auth in data['auth'].items():
            if auth['email'] == email:
                auth_id = aid
                auth_entry = auth
                break

        if not auth_entry:
            return '', 401

        # Verify password
        if not verify_password(password, auth_entry['password_hash']):
            return '', 401

        # Generate tokens
        access_token = generate_access_token(int(auth_id))
        refresh_token = generate_refresh_token(int(auth_id))

        print(f"User logged in: {email}")

        return jsonify({
            'accessToken': access_token,
            'refreshToken': refresh_token
        }), 200

    except Exception as e:
        print(f"Login error: {e}")
        return '', 500

@app.route('/auth/refresh', methods=['POST'])
def refresh():
    """Refresh access token using refresh token"""
    try:
        req_data = request.get_json()

        if not req_data or 'refreshToken' not in req_data:
            return '', 401

        refresh_token = req_data['refreshToken']

        # Validate refresh token
        auth_id = validate_refresh_token(refresh_token)

        if not auth_id:
            return '', 401

        # Delete old refresh token
        if refresh_token in data['tokens']:
            del data['tokens'][refresh_token]

        # Generate new tokens
        new_access_token = generate_access_token(auth_id)
        new_refresh_token = generate_refresh_token(auth_id)

        print(f"Token refreshed for auth_id: {auth_id}")

        return jsonify({
            'accessToken': new_access_token,
            'refreshToken': new_refresh_token
        }), 200

    except Exception as e:
        print(f"Refresh error: {e}")
        return '', 500

@app.route('/auth/verify', methods=['POST'])
def verify():
    """Verify email with verification code"""
    try:
        req_data = request.get_json()

        if not req_data:
            return jsonify(False), 400

        verification_code = req_data.get('verificationCode')
        email = req_data.get('email')

        if not verification_code or not email:
            return jsonify(False), 400

        # Find user by email and verification code
        for auth_id, auth in data['auth'].items():
            if auth['email'] == email and auth.get('verification_code') == verification_code:
                # Mark as confirmed
                data['auth'][auth_id]['confirmed_at'] = datetime.utcnow().isoformat()
                data['auth'][auth_id]['verification_code'] = None
                save_data()

                print(f"Email verified: {email}")
                return jsonify(True), 200

        return jsonify(False), 400

    except Exception as e:
        print(f"Verification error: {e}")
        return jsonify(False), 500

# ============================================================
# USER ENDPOINTS (Protected)
# ============================================================

@app.route('/api/user/info', methods=['GET'])
@require_auth
def get_user_info(auth_id):
    """Get current user information"""
    try:
        # Get auth data
        auth = data['auth'].get(str(auth_id))

        if not auth:
            return jsonify({
                'errorCode': 400,
                'errorMessage': 'User not found'
            }), 400

        # Get personal data
        personal_data = data['users'].get(str(auth_id))

        if not personal_data:
            return jsonify({
                'errorCode': 400,
                'errorMessage': 'User not found'
            }), 400

        return jsonify({
            'email': auth['email'],
            'personalData': personal_data
        }), 200

    except Exception as e:
        print(f"Get user info error: {e}")
        return '', 500

@app.route('/api/user/info', methods=['PATCH'])
@require_auth
def update_user_info(auth_id):
    """Update user profile information"""
    try:
        req_data = request.get_json()

        if not req_data:
            return jsonify({
                'errorCode': 400,
                'errorMessage': 'Update failed'
            }), 400

        # Get personal data
        personal_data = data['users'].get(str(auth_id))

        if not personal_data:
            return jsonify({
                'errorCode': 400,
                'errorMessage': 'User not found'
            }), 400

        # Update fields
        if 'firstName' in req_data:
            personal_data['firstName'] = req_data['firstName']
        if 'lastName' in req_data:
            personal_data['lastName'] = req_data['lastName']
        if 'gender' in req_data:
            personal_data['gender'] = req_data['gender']
        if 'avatarUrl' in req_data:
            personal_data['avatarUrl'] = req_data['avatarUrl']
        if 'userName' in req_data:
            personal_data['userName'] = req_data['userName']
        if 'birthDate' in req_data:
            personal_data['birthDate'] = req_data['birthDate']

        save_data()

        print(f"User info updated for auth_id: {auth_id}")

        return jsonify(True), 200

    except Exception as e:
        print(f"Update user info error: {e}")
        return jsonify({
            'errorCode': 400,
            'errorMessage': 'Update failed'
        }), 400

@app.route('/api/user/logout', methods=['POST'])
@require_auth
def logout(auth_id):
    """Logout user (invalidate specific refresh token)"""
    try:
        req_data = request.get_json()

        if not req_data or 'refreshToken' not in req_data:
            return jsonify({
                'errorCode': 400,
                'errorMessage': 'Logout failed'
            }), 400

        refresh_token = req_data['refreshToken']

        # Delete refresh token
        if refresh_token in data['tokens']:
            del data['tokens'][refresh_token]
            save_data()

        print(f"User logged out: auth_id {auth_id}")

        return jsonify(True), 200

    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({
            'errorCode': 400,
            'errorMessage': 'Logout failed'
        }), 400

@app.route('/api/user/logoutAll', methods=['POST'])
@require_auth
def logout_all(auth_id):
    """Logout from all devices (invalidate all refresh tokens)"""
    try:
        # Delete all refresh tokens for this user
        tokens_to_delete = []

        for token, token_data in data['tokens'].items():
            if token_data['authId'] == auth_id:
                tokens_to_delete.append(token)

        for token in tokens_to_delete:
            del data['tokens'][token]

        save_data()

        print(f"User logged out from all devices: auth_id {auth_id}")

        return jsonify(True), 200

    except Exception as e:
        print(f"Logout all error: {e}")
        return jsonify({
            'errorCode': 400,
            'errorMessage': 'Logout all failed'
        }), 400

# ============================================================
# HEALTH CHECK
# ============================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'UP',
        'server': 'Mock Backend (Python Flask)',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Urlaubsplaner Mock Backend API',
        'version': '1.0.0',
        'endpoints': {
            'auth': [
                'POST /auth/register',
                'POST /auth/login',
                'POST /auth/refresh',
                'POST /auth/verify'
            ],
            'user': [
                'GET /api/user/info',
                'PATCH /api/user/info',
                'POST /api/user/logout',
                'POST /api/user/logoutAll'
            ]
        }
    }), 200

# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("=" * 60)
    print("Urlaubsplaner Mock Backend Server")
    print("=" * 60)
    print(f"Data file: {DATA_FILE}")
    print(f"Users: {len(data.get('users', {}))}")
    print(f"Auth entries: {len(data.get('auth', {}))}")
    print(f"Active tokens: {len(data.get('tokens', {}))}")
    print("=" * 60)
    print("Server starting on http://localhost:8080")
    print("=" * 60)

    app.run(host='0.0.0.0', port=8080, debug=True)
