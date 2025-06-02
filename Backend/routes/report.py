from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from Backend.models import db, PostComment, Review
from datetime import datetime
from sqlalchemy import text

report_bp = Blueprint('report', __name__)

@report_bp.route('/api/report/comment', methods=['POST'])
@login_required
def report_comment():
    data = request.get_json()
    comment_id = data.get('comment_id')

    if not comment_id:
        return jsonify({'error': 'Missing comment ID'}), 400

    comment = PostComment.query.get(comment_id)
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    # Wrap raw SQL query in text()
    sql = text('''
        SELECT id FROM report
        WHERE comment_id = :comment_id AND reported_user_id = :reported_user_id
        LIMIT 1
    ''')

    existing = db.session.execute(sql, {
        'comment_id': comment_id,
        'reported_user_id': comment.user_id
    }).fetchone()

    if existing:
        return jsonify({'message': 'Already reported.'}), 200

    insert_sql = text('''
        INSERT INTO report (reported_user_id, comment_id, reason, status, created_at)
        VALUES (:reported_user_id, :comment_id, :reason, :status, :created_at)
    ''')

    db.session.execute(
        insert_sql,
        {
            'reported_user_id': comment.user_id,
            'comment_id': comment_id,
            'reason': 'Inappropriate comment',
            'status': 'pending',
            'created_at': datetime.utcnow()
        }
    )
    db.session.commit()

    return jsonify({'message': 'Comment reported successfully'}), 200

@report_bp.route('/api/report/review', methods=['POST'])
@login_required
def report_review():
    data = request.get_json()
    review_id = data.get('review_id')

    if not review_id:
        return jsonify({'error': 'Missing review_id'}), 400

    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    sql = text('''
        SELECT id FROM report
        WHERE review_id = :review_id AND reported_user_id = :reported_user_id
        LIMIT 1
    ''')

    existing = db.session.execute(sql, {
        'review_id': review_id,
        'reported_user_id': review.user_id
    }).fetchone()

    if existing:
        return jsonify({'message': 'Already reported.'}), 200

    insert_sql = text('''
        INSERT INTO report (reported_user_id, review_id, reason, status, created_at)
        VALUES (:reported_user_id, :review_id, :reason, :status, :created_at)
    ''')

    db.session.execute(
        insert_sql,
        {
            'reported_user_id': review.user_id,
            'review_id': review_id,
            'reason': 'Inappropriate review',
            'status': 'pending',
            'created_at': datetime.utcnow()
        }
    )
    db.session.commit()

    return jsonify({'message': 'Review reported successfully'})
