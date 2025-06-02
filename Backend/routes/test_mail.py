from flask import Blueprint, jsonify
from flask_mail import Message
from Backend.__init__ import mail
import os

mail_debug_bp = Blueprint('mail_debug', __name__)

@mail_debug_bp.route('/api/test-mail', methods=['GET'])
def test_mail():
    try:
        msg = Message(
            subject='Flask Mail Test',
            sender=os.getenv('MAIL_DEFAULT_SENDER'),
            recipients=[os.getenv('MAIL_USERNAME')],
            body='This is a test email from your Flask app.'
        )
        mail.send(msg)
        return jsonify({'message': 'Test email sent successfully!'}), 200
    except Exception as e:
        print("Mail send failed:", e)
        return jsonify({'error': str(e)}), 500
