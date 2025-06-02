from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from Backend.models import db, DevelopmentFeedback, User

feedback_bp = Blueprint('feedback', __name__)

# === Submit Feedback ===
@feedback_bp.route('/submit', methods=['POST'])  # ✅ fixed endpoint (no duplicate prefix)
@login_required
def submit_feedback():
    data = request.get_json()
    topic = data.get('topic')
    message = data.get('message')

    if not topic or not message:
        return jsonify({'error': 'Both topic and message are required.'}), 400

    feedback = DevelopmentFeedback(
        user_id=current_user.id,
        topic=topic,
        content=message
    )
    db.session.add(feedback)
    db.session.commit()

    return jsonify({'message': 'Feedback submitted successfully.'}), 201

# === Admin: View All Feedback ===
@feedback_bp.route('/all', methods=['GET'])  # ✅ simplified to match url_prefix
@login_required
def view_all_feedback():
    if not getattr(current_user, 'admin', False):
        return jsonify({'error': 'Admins only.'}), 403

    all_feedback = DevelopmentFeedback.query.order_by(DevelopmentFeedback.created_at.desc()).all()
    return jsonify([
        {
            'id': fb.id,
            'user': fb.user.username,
            'topic': fb.topic,
            'message': fb.content,
            'created_at': fb.created_at
        } for fb in all_feedback
    ])