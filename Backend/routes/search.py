from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from Backend.models import User

search_bp = Blueprint('search', __name__)

@search_bp.route('/user/search')
@login_required
def search_users():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify([])

    users = User.query.filter(User.username.ilike(f"%{query}%")) \
        .filter(User.id != current_user.id).all()

    return jsonify([
        {
            'username': user.username,
            'id': user.id,
            'bio': getattr(user, 'bio', '') or ''
        } for user in users
    ])
