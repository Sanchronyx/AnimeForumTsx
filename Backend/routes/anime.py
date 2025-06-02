from flask import Blueprint, jsonify, request
from Backend.models import db, Anime, Review, Post, User

anime_bp = Blueprint('anime', __name__)

@anime_bp.route('/api/home')
def home_data():
    # Top 10 Anime by Score
    top_anime = Anime.query.order_by(Anime.score.desc()).limit(10).all()
    top_anime_data = [
        {
            "id": anime.id,
            "title": anime.title,
            "score": anime.score,
            "image_url": anime.image_url
        }
        for anime in top_anime
    ]

    # 10 Most Recent Reviews
    recent_reviews = (
        db.session.query(Review, Anime, User)
        .join(Anime, Review.anime_id == Anime.id)
        .join(User, Review.user_id == User.id)
        .order_by(Review.created_at.desc())
        .limit(10)
        .all()
    )
    recent_review_data = [
        {
            "id": review.id,
            "text": review.text,
            "user": user.username,
            "anime_title": anime.title
        }
        for review, anime, user in recent_reviews
    ]

    # 10 Most Recent Threads (Posts)
    recent_threads = (
        db.session.query(Post, User)
        .join(User, Post.user_id == User.id)
        .order_by(Post.created_at.desc())
        .limit(5)
        .all()
    )
    recent_thread_data = [
        {
            "id": thread.id,
            "title": thread.title,
            "content": thread.content,
            "user": user.username
        }
        for thread, user in recent_threads
    ]

    return jsonify({
        "top_anime": top_anime_data,
        "recent_reviews": recent_review_data,
        "recent_posts": recent_thread_data
    })

@anime_bp.route('/api/anime/<int:id>')
def get_anime(id):
    anime = Anime.query.get(id)  # Slightly cleaner than filter_by(id=id).first()
    if not anime:
        return jsonify({'error': 'Anime not found'}), 404

    return jsonify({
        'id': anime.id,
        'mal_id': anime.mal_id,
        'title': anime.title,
        'image_url': anime.image_url,
        'synopsis': anime.synopsis,
        'score': anime.score,
        'episodes': anime.episodes,
        'year': anime.year,
        'genres': anime.genres.split(', ') if anime.genres else [],
        'studios': anime.studios.split(', ') if anime.studios else [],
        'type': anime.type,
        'status': anime.status,
        'duration': anime.duration,
        'popularity': anime.popularity,
        'members': anime.members,
        'favorites': anime.favorites,
        'source': anime.source,
    })

@anime_bp.route("/api/anime/browse")
def browse_anime():
    page = request.args.get('page', 1, type=int)
    query = Anime.query

    title = request.args.get('title')
    genre = request.args.get('genre')
    type_ = request.args.get('type')
    status = request.args.get('status')

    if title:
        query = query.filter(Anime.title.ilike(f"%{title}%"))
    if genre:
        query = query.filter(Anime.genres.ilike(f"%{genre}%"))
    if type_:
        query = query.filter(Anime.type == type_)
    if status:
        query = query.filter(Anime.status == status)

    pagination = query.paginate(page=page, per_page=20, error_out=False)

    return jsonify({
        "anime": [{
            "id": a.id,
            "title": a.title,
            "image_url": a.image_url,
            "score": a.score,
            "episodes": a.episodes,
            "year": a.year
        } for a in pagination.items],
        "total_pages": pagination.pages,
        "current_page": pagination.page
    })

