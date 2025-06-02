from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from Backend.models import db, Comment, Anime, Report
from Backend.routes.notifications import create_notification

comment_bp = Blueprint('comment', __name__)

@comment_bp.route('/api/comments/<int:anime_id>', methods=['GET'])
def get_comments(anime_id):
    comments = Comment.query.filter_by(anime_id=anime_id).order_by(Comment.created_at.desc()).all()
    return jsonify([
        {
            "id": c.id,
            "text": c.text,
            "user": c.user.username,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M")
        } for c in comments
    ])

@comment_bp.route('/api/comments', methods=['POST'])
@login_required
def post_comment():
    data = request.get_json()
    anime_id = data.get('anime_id')
    text = data.get('text', "").strip()

    if not anime_id or not text:
        return jsonify({"error": "anime_id and text are required"}), 400

    anime = Anime.query.get(anime_id)
    if not anime:
        return jsonify({"error": "Anime not found"}), 404

    comment = Comment(user_id=current_user.id, anime_id=anime_id, text=text)
    db.session.add(comment)
    db.session.commit()

    if anime.user_id != current_user.id:
        create_notification(anime.user_id, f"{current_user.username} commented on your anime '{anime.title}'")

    return jsonify({
        "id": comment.id,
        "text": comment.text,
        "user": current_user.username,
        "created_at": comment.created_at.strftime("%Y-%m-%d %H:%M")
    })

@comment_bp.route('/report/comment', methods=['POST'])
@login_required
def report_comment():
    data = request.get_json()
    comment_id = data.get('comment_id')
    if not comment_id:
        return jsonify({'error': 'comment_id is required'}), 400

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    report = Report(
        reported_user_id=comment.user_id,
        reason='Reported via forum comment button',
        status='pending'
    )
    db.session.add(report)
    db.session.commit()

    return jsonify({'message': 'Comment reported successfully'})