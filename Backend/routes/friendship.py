from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from Backend.models import db, User, Friendship, FriendRequest, Message
from datetime import datetime
from sqlalchemy import or_, and_

friendship_bp = Blueprint('friendship', __name__)

# --- Friend Request Routes ---
@friendship_bp.route('/friend-request/<int:target_id>', methods=['POST'])
@login_required
def send_friend_request(target_id):
    if target_id == current_user.id:
        return jsonify({'error': 'You cannot friend yourself'}), 400

    target = User.query.get(target_id)
    if not target:
        return jsonify({'error': 'User not found'}), 404

    if FriendRequest.query.filter_by(sender_id=current_user.id, receiver_id=target_id).first():
        return jsonify({'error': 'Friend request already sent'}), 400

    if Friendship.query.filter_by(user_id=current_user.id, friend_id=target_id).first():
        return jsonify({'error': 'Already friends'}), 400

    req = FriendRequest(sender_id=current_user.id, receiver_id=target_id, status='pending', created_at=datetime.utcnow())
    db.session.add(req)
    db.session.commit()
    return jsonify({'message': 'Friend request sent'})

@friendship_bp.route('/friend-request/<int:request_id>/accept', methods=['POST'])
@login_required
def accept_friend_request(request_id):
    req = FriendRequest.query.get_or_404(request_id)
    if req.receiver_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    # Check if friendships already exist to avoid IntegrityError
    exists1 = Friendship.query.filter_by(user_id=req.sender_id, friend_id=req.receiver_id).first()
    exists2 = Friendship.query.filter_by(user_id=req.receiver_id, friend_id=req.sender_id).first()

    if not exists1:
        db.session.add(Friendship(user_id=req.sender_id, friend_id=req.receiver_id))
    if not exists2:
        db.session.add(Friendship(user_id=req.receiver_id, friend_id=req.sender_id))

    db.session.delete(req)
    db.session.commit()
    return jsonify({'message': 'Friend request accepted'})

@friendship_bp.route('/friend-request/<int:request_id>/reject', methods=['POST'])
@login_required
def reject_friend_request(request_id):
    req = FriendRequest.query.get_or_404(request_id)
    if req.receiver_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(req)
    db.session.commit()
    return jsonify({'message': 'Friend request rejected'})

@friendship_bp.route('/friend-requests', methods=['GET'])
@login_required
def get_friend_requests():
    requests = FriendRequest.query.filter_by(receiver_id=current_user.id).all()
    return jsonify([{
        'id': r.id,
        'sender_id': r.sender_id,
        'receiver_id': r.receiver_id,
        'sender_username': User.query.get(r.sender_id).username
    } for r in requests])

# --- Friend List Routes ---
@friendship_bp.route('/friends', methods=['GET'])
@login_required
def get_friend_usernames():
    friendships = Friendship.query.filter_by(user_id=current_user.id).all()
    return jsonify([User.query.get(f.friend_id).username for f in friendships])

@friendship_bp.route('/friends/list', methods=['GET'])
@login_required
def get_friend_details():
    friendships = Friendship.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'username': User.query.get(f.friend_id).username,
        'id': f.friend_id
    } for f in friendships])

# --- Messaging Routes ---
@friendship_bp.route('/messages/<username>', methods=['GET'])
@login_required
def get_conversation(username):
    friend = User.query.filter_by(username=username).first()
    if not friend:
        return jsonify({'error': 'User not found'}), 404

    if not Friendship.query.filter_by(user_id=current_user.id, friend_id=friend.id).first():
        return jsonify({'error': 'You are not friends'}), 403

    messages = Message.query.filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == friend.id),
            and_(Message.sender_id == friend.id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()

    return jsonify([{
        'from': msg.sender_id,
        'to': msg.receiver_id,
        'text': msg.text,
        'time': msg.created_at.isoformat()
    } for msg in messages])

@friendship_bp.route('/messages/<username>', methods=['POST'])
@login_required
def post_message(username):
    friend = User.query.filter_by(username=username).first()
    if not friend:
        return jsonify({'error': 'User not found'}), 404

    if not Friendship.query.filter_by(user_id=current_user.id, friend_id=friend.id).first():
        return jsonify({'error': 'You are not friends'}), 403

    data = request.get_json()
    if not data.get('text'):
        return jsonify({'error': 'Text is required'}), 400

    msg = Message(sender_id=current_user.id, receiver_id=friend.id, text=data['text'], created_at=datetime.utcnow())
    db.session.add(msg)
    db.session.commit()
    return jsonify({'message': 'Sent'})

# --- Search ---
@friendship_bp.route('/user/search', methods=['GET'])
@login_required
def search_users():
    query = request.args.get('query', '').strip().lower()
    if not query:
        return jsonify([])

    results = User.query.filter(User.username.ilike(f"%{query}%")).limit(10).all()
    return jsonify([{'id': user.id, 'username': user.username} for user in results])

@friendship_bp.route('/conversations', methods=['GET'])
@login_required
def get_conversations():
    friends = Friendship.query.filter_by(user_id=current_user.id).all()
    conversations = []
    for f in friends:
        friend = db.session.get(User, f.friend_id)
        last_msg = Message.query.filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == friend.id),
                and_(Message.sender_id == friend.id, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at.desc()).first()

        conversations.append({
            'friend_id': friend.id,
            'friend_username': friend.username,
            'last_message': last_msg.text if last_msg else '',
            'last_time': last_msg.created_at.isoformat() if last_msg else None
        })
    return jsonify(conversations)
