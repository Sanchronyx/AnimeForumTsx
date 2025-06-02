from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from Backend.models import db, UserCollection, Anime
from Backend.routes.notifications import notify_add_to_collection

collection_bp = Blueprint('collection', __name__)

@collection_bp.route('/api/collections', methods=['POST'])
@login_required
def add_to_collection():
    data = request.get_json()
    anime_id = data.get('anime_id')
    collection_name = data.get('collection_name')

    if not anime_id or not collection_name:
        return jsonify({"error": "Missing anime_id or collection_name"}), 400

    # Check anime exists
    anime = Anime.query.get(anime_id)
    if not anime:
        return jsonify({"error": "Anime not found"}), 404

    # Update or create collection entry
    entry = UserCollection.query.filter_by(
        user_id=current_user.id,
        anime_id=anime_id
    ).first()

    if entry:
        entry.collection_name = collection_name
        message = "Collection updated."
    else:
        entry = UserCollection(
            user_id=current_user.id,
            anime_id=anime_id,
            collection_name=collection_name
        )
        db.session.add(entry)
        message = "Added to collection."

    db.session.commit()

    notify_add_to_collection(current_user.id, anime_id, collection_name)

    return jsonify({"message": message})