from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from Backend.models import Notification, db, Post, PostComment, UserCollection, Anime

notifications_bp = Blueprint('notifications', __name__)

# GET: Fetch all notifications for the logged-in user
@notifications_bp.route('/notifications', methods=['GET'])
@login_required
def get_notifications():
    notes = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    return jsonify([
        {
            'id': n.id,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at
        } for n in notes
    ])

# POST: Mark all notifications as read
@notifications_bp.route('/notifications/mark-all-read', methods=['POST'])
@login_required
def mark_all_as_read():
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'})

# HELPER: Create a new notification
def create_notification(user_id: int, message: str):
    if user_id != current_user.id:  # Avoid notifying yourself
        note = Notification(user_id=user_id, message=message)
        db.session.add(note)
        db.session.commit()

# ADMIN: Create a warning notification

def notify_admin_warning(user_id: int):
    create_notification(user_id, "⚠️ You have received an official warning from the admin team.")

# TRIGGER EXAMPLES (to be used in other routes)

def notify_comment(post_id: int):
    post = Post.query.get(post_id)
    if post:
        create_notification(post.user_id, f"{current_user.username} commented on your post '{post.title}'")

def notify_like(post_id: int):
    post = Post.query.get(post_id)
    if post:
        create_notification(post.user_id, f"{current_user.username} liked your post '{post.title}'")

def notify_add_to_collection(user_id: int, anime_id: int, collection_name: str):
    anime = Anime.query.get(anime_id)
    if anime:
        create_notification(user_id, f"'{anime.title}' was added to your '{collection_name}' collection")
