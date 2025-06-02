from flask import Blueprint, request, jsonify, session, make_response
from Backend.models import db, User
from flask_login import login_user, current_user, logout_user, login_required
from sqlalchemy.exc import IntegrityError
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not password or not email:
        return jsonify({'error': 'Username, email, and password required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already in use'}), 409

    try:
        user = User(
            username=username,
            email=email,
            created_at=datetime.utcnow(),
            is_admin=False
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify({'id': user.id, 'username': user.username}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'A user with that email already exists'}), 409

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        login_user(user)
        session.permanent = True
        session['login_confirmed'] = True
        return make_response(jsonify({
            'id': user.id,
            'username': user.username,
            'is_admin': user.is_admin
        }), 200)

    return jsonify({'error': 'Invalid credentials'}), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    logout_user()
    session.clear()
    return jsonify({'message': 'Logged out'}), 200


@auth_bp.route('/whoami', methods=['GET'])
@login_required
def whoami():
    return jsonify({
        'authenticated': True,
        'id': current_user.id,
        'username': current_user.username,
        'is_admin': current_user.is_admin
    })