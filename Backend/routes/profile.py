from flask import Blueprint, jsonify
from flask_login import current_user, login_required
from Backend.models import db, User, Anime, Review, Post, UserCollection

profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/api/profile/<string:username>")
@login_required
def get_profile(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Collections
    valid_collections = ["favorites", "watching", "completed", "dropped", "on-hold"]
    collections = {}
    for collection_name in valid_collections:
        entries = UserCollection.query.filter_by(user_id=user.id, collection_name=collection_name).all()
        collections[collection_name] = [
            {
                "id": anime.id,
                "title": anime.title,
                "image_url": anime.image_url
            }
            for entry in entries
            if (anime := Anime.query.get(entry.anime_id)) is not None
        ]

    # Ratings
    ratings = Review.query.filter(Review.user_id == user.id, Review.rating != None).all()
    ratings_data = [
        {
            "anime_id": r.anime_id,
            "anime_title": r.anime.title if r.anime else "Unknown",
            "score": r.rating
        } for r in ratings
    ]

    # Reviews
    reviews = Review.query.filter(Review.user_id == user.id, Review.text != "").all()
    review_data = [
        {
            "anime_id": r.anime_id,
            "anime_title": r.anime.title if r.anime else "Unknown",
            "text": r.text,
            "rating": r.rating,
            "created_at": r.created_at.strftime("%Y-%m-%d") if r.created_at else None
        } for r in reviews
    ]

    # Posts
    posts = Post.query.filter_by(user_id=user.id).order_by(Post.created_at.desc()).all()
    post_data = [
        {
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "created_at": p.created_at.strftime("%Y-%m-%d") if p.created_at else None
        } for p in posts
    ]

    return jsonify({
        "username": user.username,
        "collections": collections,
        "ratings": ratings_data,
        "reviews": review_data,
        "posts": post_data
    })
