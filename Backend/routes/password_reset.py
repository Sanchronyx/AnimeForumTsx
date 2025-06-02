from flask import Blueprint, request, jsonify, url_for
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from Backend.extensions import db, bcrypt
from Backend.models import User
from Backend.__init__ import mail
import os

password_reset_bp = Blueprint('password_reset', __name__)

# Token serializer using secret key
serializer = URLSafeTimedSerializer(os.getenv('SECRET_KEY', 'supersecretkey'))

@password_reset_bp.route('/api/request-password-reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Email not found'}), 404

    token = serializer.dumps(email, salt='password-reset-salt')
    reset_link = url_for('password_reset.reset_with_token', token=token, _external=True)

    msg = Message('Password Reset Request', sender=os.getenv('MAIL_DEFAULT_SENDER'), recipients=[email])
    msg.body = (
        f"Hello,\n\n"
        f"You requested a password reset. Click the link below to reset your password:\n"
        f"{reset_link}\n\n"
        f"This link will expire in 30 minutes. If you did not request this, please ignore this message."
    )

    try:
        mail.send(msg)
    except Exception as e:
        print(f"Mail send failed: {e}")
        return jsonify({'error': 'Failed to send email. Check mail configuration.'}), 500

    return jsonify({'message': 'Password reset link sent to your email.'})

@password_reset_bp.route('/api/reset-password/<token>', methods=['GET'])
def reset_with_token(token):
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=1800)
    except (SignatureExpired, BadSignature):
        return jsonify({'error': 'Invalid or expired token'}), 400

    return jsonify({'message': 'Token is valid', 'email': email})

@password_reset_bp.route('/api/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=1800)
    except (SignatureExpired, BadSignature):
        return jsonify({'error': 'Invalid or expired token'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    new_password = data.get('password')
    if not new_password:
        return jsonify({'error': 'Password is required'}), 400

    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'})
