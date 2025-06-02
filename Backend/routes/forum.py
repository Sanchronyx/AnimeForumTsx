from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from Backend.models import db, Post, PostComment, PostLike, Tag, User
from datetime import datetime
from Backend.routes.notifications import notify_comment, notify_like

forum_bp = Blueprint('forum', __name__, url_prefix='/api/forum')

VALID_GENRES = {
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
    "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "General"
}

@forum_bp.route('/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.order_by(Tag.name).all()
    return jsonify([tag.name for tag in tags])

@forum_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([
        {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'author': post.user.username,
            'created_at': post.created_at.isoformat(),
            'edited': False,
            'likes': sum(1 for like in post.likes if like.is_like),
            'dislikes': sum(1 for like in post.likes if not like.is_like),
            'tags': [tag.name for tag in post.tags]
        } for post in posts
    ])

@forum_bp.route('/posts', methods=['POST'])
@login_required
def create_post():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    tag_names = data.get('tags', [])

    if not tag_names or not isinstance(tag_names, list):
        return jsonify({"error": "At least one genre tag is required."}), 400

    valid_tags = [tag for tag in tag_names if tag in VALID_GENRES]
    if not valid_tags:
        return jsonify({"error": "All tags must be valid anime genres."}), 400

    post = Post(title=title, content=content, user_id=current_user.id)
    db.session.add(post)
    db.session.flush()

    for tag_name in valid_tags:
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
            db.session.flush()
        post.tags.append(tag)

    db.session.commit()
    return jsonify({'message': 'Post created successfully'}), 201

@forum_bp.route('/posts/<int:post_id>', methods=['PUT'])
@login_required
def edit_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    post.content = request.json['content']
    post.created_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Post updated'})

@forum_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'})

@forum_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@login_required
def like_post(post_id):
    post = Post.query.get_or_404(post_id)
    existing = PostLike.query.filter_by(user_id=current_user.id, post_id=post_id).first()

    if existing:
        if existing.is_like:
            db.session.delete(existing)
        else:
            existing.is_like = True
    else:
        db.session.add(PostLike(user_id=current_user.id, post_id=post_id, is_like=True))

    db.session.commit()
    notify_like(post_id)
    return jsonify({'message': 'Like toggled'})

@forum_bp.route('/posts/<int:post_id>/dislike', methods=['POST'])
@login_required
def dislike_post(post_id):
    post = Post.query.get_or_404(post_id)
    existing = PostLike.query.filter_by(user_id=current_user.id, post_id=post_id).first()

    if existing:
        if not existing.is_like:
            db.session.delete(existing)
        else:
            existing.is_like = False
    else:
        db.session.add(PostLike(user_id=current_user.id, post_id=post_id, is_like=False))

    db.session.commit()
    return jsonify({'message': 'Dislike toggled'})

@forum_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = PostComment.query.filter_by(post_id=post_id).order_by(PostComment.created_at).all()
    return jsonify([
        {
            'id': c.id,
            'text': c.text,
            'author': c.user.username,
            'created_at': c.created_at.isoformat()
        } for c in comments
    ])

@forum_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@login_required
def add_comment(post_id):
    comment = PostComment(text=request.json['text'], post_id=post_id, user_id=current_user.id)
    db.session.add(comment)
    db.session.commit()
    notify_comment(post_id)
    return jsonify({'username': current_user.username, 'text': comment.text})

@forum_bp.route('/post/user/<string:username>', methods=['GET'])
@login_required
def get_posts_by_user(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()
    return jsonify([
        {
            'id': p.id,
            'title': p.title,
            'text': p.content,
            'created_at': p.created_at.isoformat(),
            'likes': sum(1 for like in p.likes if like.is_like),
            'dislikes': sum(1 for like in p.likes if not like.is_like)
        } for p in posts
    ])

@forum_bp.route('/user/<username>', methods=['GET'])
def get_user_posts(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify([])

    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()
    return jsonify([
        {
            'id': p.id,
            'title': p.title,
            'text': p.content,
            'created_at': p.created_at,
            'likes': sum(1 for like in p.likes if like.is_like),
            'dislikes': sum(1 for like in p.likes if not like.is_like)
        } for p in posts
    ])
