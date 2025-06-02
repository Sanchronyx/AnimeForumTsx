# ✅ Filter out anime with no valid MAL score before sorting
from flask import Blueprint, jsonify
from Backend.models import Anime, Review, Post, UserCollection, User
from Backend.extensions import db
from sqlalchemy import desc

home_bp = Blueprint('home', __name__)

@home_bp.route("/api/home")
def public_home():
    try:
        print("Fetching top anime with valid MAL scores only...")
        top_anime = Anime.query.filter(Anime.score != None).filter(Anime.score > 0).order_by(desc(Anime.score)).limit(10).all()

        most_popular = Anime.query.order_by(Anime.popularity.asc().nullslast()).limit(10).all()
        recent_reviews = Review.query.order_by(Review.created_at.desc()).limit(6).all()
        recent_posts = Post.query.order_by(Post.created_at.desc()).limit(6).all()

        return jsonify({
            "top_anime": [
                {
                    "id": a.id,
                    "title": a.title or "Untitled",
                    "image_url": a.image_url,
                    "score": a.score,
                    "episodes": a.episodes,
                    "status": a.status,
                    "year": a.year,
                } for a in top_anime
            ],
            "most_popular": [
                {
                    "id": a.id,
                    "title": a.title or "Untitled",
                    "image_url": a.image_url,
                    "score": a.score,
                    "episodes": a.episodes,
                    "status": a.status,
                    "year": a.year,
                } for a in most_popular
            ],
            "recent_reviews": [
                {
                    "id": r.id,
                    "anime_title": r.anime.title if r.anime and r.anime.title else "Unknown",
                    "text": (r.text[:150] + "...") if r.text else "",
                    "user": r.user.username if r.user else "Anonymous"
                } for r in recent_reviews
            ],
            "recent_posts": [
                {
                    "id": p.id,
                    "title": p.title or "Untitled",
                    "content": (p.content[:100] + "...") if p.content else "",
                    "user": p.user.username if p.user else "Anonymous"
                } for p in recent_posts
            ]
        })
    except Exception as e:
        print("/api/home failed with exception:", repr(e))
        return jsonify({"error": "Failed to fetch homepage data."}), 500