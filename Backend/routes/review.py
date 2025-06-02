from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from Backend.models import db, Review, ReviewComment, ReviewLike, Anime, User
from sqlalchemy import func
from datetime import datetime

review_bp = Blueprint('review', __name__, url_prefix='/api/review')


def to_dict(self):
    return {
        "id": self.id,
        "anime_id": self.anime_id,
        "user_id": self.user_id,
        "anime_title": self.anime.title if self.anime else None,
        "text": self.text,
        "rating": self.rating,
        "created_at": self.created_at.isoformat() if self.created_at else None,
        "likes": len([like for like in self.likes if like.is_like]),
        "dislikes": len([like for like in self.likes if not like.is_like]),
    }

Review.to_dict = to_dict


@review_bp.route('/user/<string:username>', methods=['GET'])
@login_required
def get_reviews_by_username(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    reviews = Review.query.filter_by(user_id=user.id).all()
    return jsonify([review.to_dict() for review in reviews]), 200


@review_bp.route('/<int:review_id>/like', methods=['POST'])
@login_required
def like_review(review_id):
    review = Review.query.get_or_404(review_id)
    like = ReviewLike.query.filter_by(user_id=current_user.id, review_id=review_id).first()
    if not like:
        like = ReviewLike(user_id=current_user.id, review_id=review_id, is_like=True)
        db.session.add(like)
    else:
        like.is_like = True
    db.session.commit()
    return jsonify({'message': 'Liked'})


@review_bp.route('/<int:review_id>/dislike', methods=['POST'])
@login_required
def dislike_review(review_id):
    review = Review.query.get_or_404(review_id)
    like = ReviewLike.query.filter_by(user_id=current_user.id, review_id=review_id).first()
    if not like:
        like = ReviewLike(user_id=current_user.id, review_id=review_id, is_like=False)
        db.session.add(like)
    else:
        like.is_like = False
    db.session.commit()
    return jsonify({'message': 'Disliked'})


@review_bp.route('/<int:review_id>/comments', methods=['GET'])
@login_required
def get_comments(review_id):
    review = Review.query.get_or_404(review_id)
    comments = ReviewComment.query.filter_by(review_id=review_id).order_by(ReviewComment.created_at.asc()).all()
    return jsonify([{'username': c.user.username, 'text': c.text} for c in comments])


@review_bp.route('/<int:review_id>/comments', methods=['POST'])
@login_required
def add_review_comment(review_id):
    review = Review.query.get_or_404(review_id)
    data = request.get_json()
    text = data.get('text', '').strip()
    if not text:
        return jsonify({'error': 'Comment cannot be empty'}), 400

    comment = ReviewComment(
        review_id=review.id,
        user_id=current_user.id,
        text=text,
        created_at=datetime.utcnow()
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify({'username': current_user.username, 'text': comment.text}), 201


@review_bp.route('', methods=['POST'])
@login_required
def submit_review():
    data = request.get_json()
    anime_id = data.get('anime_id')
    text = data.get('text', "").strip()
    rating = data.get('rating')

    if not anime_id or not text or not (1 <= rating <= 10):
        return jsonify({"error": "anime_id, text, and valid rating are required"}), 400

    anime = Anime.query.get(anime_id)
    if not anime:
        return jsonify({"error": "Anime not found"}), 404

    review = Review.query.filter_by(user_id=current_user.id, anime_id=anime_id).first()

    if review:
        review.text = text
        review.rating = rating
        message = "Review updated."
    else:
        review = Review(user_id=current_user.id, anime_id=anime_id, text=text, rating=rating, created_at=datetime.utcnow())
        db.session.add(review)
        message = "Review created."

    db.session.commit()
    return jsonify({"message": message})


@review_bp.route('/<int:review_id>', methods=['PUT'])
@login_required
def edit_review(review_id):
    data = request.get_json()
    new_text = data.get("text", "").strip()
    review = Review.query.get_or_404(review_id)

    if review.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    review.text = new_text
    db.session.commit()
    return jsonify({'message': 'Review updated'})


@review_bp.route('/<int:review_id>', methods=['DELETE'])
@login_required
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)

    if review.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({'message': 'Review deleted'})


@review_bp.route('/anime/<int:anime_id>', methods=['GET'])
def get_reviews_for_anime(anime_id):
    anime = Anime.query.get(anime_id)
    if not anime:
        return jsonify({"error": "Anime not found"}), 404

    reviews = (
        db.session.query(Review, User)
        .join(User, Review.user_id == User.id)
        .filter(Review.anime_id == anime_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    review_list = [
        {
            "id": review.id,
            "rating": review.rating,
            "text": review.text,
            "user": user.username,
            "likes": ReviewLike.query.filter_by(review_id=review.id, is_like=True).count(),
            "dislikes": ReviewLike.query.filter_by(review_id=review.id, is_like=False).count(),
            "created_at": review.created_at.isoformat()
        } for review, user in reviews
    ]

    avg_rating = (
        db.session.query(func.avg(Review.rating))
        .filter(Review.anime_id == anime_id)
        .scalar()
    )
    avg_rating = round(avg_rating, 2) if avg_rating else None

    user_review_data = None
    if current_user.is_authenticated:
        user_review = Review.query.filter_by(user_id=current_user.id, anime_id=anime_id).first()
        if user_review:
            user_review_data = {
                "id": user_review.id,
                "rating": user_review.rating,
                "text": user_review.text,
                "user": current_user.username,
                "likes": ReviewLike.query.filter_by(review_id=user_review.id, is_like=True).count(),
                "dislikes": ReviewLike.query.filter_by(review_id=user_review.id, is_like=False).count(),
                "created_at": user_review.created_at.isoformat()
            }

    return jsonify({
        "average_rating": avg_rating,
        "reviews": review_list,
        "user_review": user_review_data
    })
