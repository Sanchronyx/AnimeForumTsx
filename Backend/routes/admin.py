from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from functools import wraps

from Backend.models import (
    db, User, Report, DevelopmentFeedback,
    WarningMessage, News, AdminActionLog, Notification
)
from Backend.routes.notifications import create_notification

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    @login_required
    def decorated_function(*args, **kwargs):
        if not getattr(current_user, 'is_admin', False):
            return jsonify({'error': 'Admins only'}), 403
        return f(*args, **kwargs)
    return decorated_function

def log_admin_action(admin, action_type, target_username, detail):
    entry = AdminActionLog(
        admin_id=admin.id,
        action_type=action_type,
        target_username=target_username,
        detail=detail,
        created_at=datetime.utcnow()
    )
    db.session.add(entry)
    db.session.commit()

def create_notification(user_id, message):
    note = Notification(user_id=user_id, message=message, is_read=False, created_at=datetime.utcnow())
    db.session.add(note)

@admin_bp.route('/admin/dev-feedback', methods=['GET'])
@admin_required
def view_dev_feedback():
    feedback_list = DevelopmentFeedback.query.order_by(DevelopmentFeedback.created_at.desc()).all()
    return jsonify([
        {
            'id': fb.id,
            'user_id': fb.user.id,
            'username': fb.user.username,
            'topic': fb.topic,
            'content': fb.content,
            'created_at': fb.created_at
        } for fb in feedback_list
    ])

@admin_bp.route('/admin/news', methods=['POST'])
@admin_required
def create_news():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    if not title or not content:
        return jsonify({'error': 'Title and content required'}), 400
    news = News(title=title, content=content, created_by=current_user.id)
    db.session.add(news)
    db.session.commit()
    log_admin_action(current_user, 'CREATE_NEWS', current_user.username, f'Title: {title}')
    return jsonify({'message': 'News posted successfully'}), 201

@admin_bp.route('/admin/news/<int:news_id>', methods=['PUT'])
@admin_required
def update_news(news_id):
    news = News.query.get(news_id)
    if not news:
        return jsonify({'error': 'News not found'}), 404
    data = request.get_json()
    news.title = data.get('title', news.title)
    news.content = data.get('content', news.content)
    db.session.commit()
    log_admin_action(current_user, 'UPDATE_NEWS', current_user.username, f'Updated ID {news_id}')
    return jsonify({'message': 'News updated'})

@admin_bp.route('/admin/news/<int:news_id>', methods=['DELETE'])
@admin_required
def delete_news(news_id):
    news = News.query.get(news_id)
    if not news:
        return jsonify({'error': 'News not found'}), 404
    db.session.delete(news)
    db.session.commit()
    log_admin_action(current_user, 'DELETE_NEWS', current_user.username, f'Deleted ID {news_id}')
    return jsonify({'message': 'News deleted'})

@admin_bp.route('/admin/send-warning', methods=['POST'])
@admin_required
def send_warning():
    data = request.get_json()
    user_id = data.get('user_id')
    message = data.get('message')
    if not user_id or not message:
        return jsonify({'error': 'User ID and warning message are required.'}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    warning = WarningMessage(user_id=user.id, message=message, created_at=datetime.utcnow())
    db.session.add(warning)
    create_notification(user_id=user.id, message=f"⚠️ Admin Warning: {message}")
    db.session.commit()
    log_admin_action(current_user, 'SEND_WARNING', user.username, message)
    return jsonify({'message': f'Warning sent to {user.username}'}), 201

@admin_bp.route('/admin/reports', methods=['GET'])
@admin_required
def get_reports():
    reports = Report.query.order_by(Report.id.desc()).all()
    return jsonify([
        {
            'id': r.id,
            'reported_user_id': r.reported_user_id,
            'reported_user': User.query.get(r.reported_user_id).username,
            'reason': r.reason,
            'status': r.status
        } for r in reports
    ])

@admin_bp.route('/admin/ban-user', methods=['POST'])
@admin_required
def ban_user():
    data = request.get_json()
    username = data.get('username')
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.is_banned = True
    create_notification(user_id=user.id, message="🚫 You have been banned from the platform.")
    db.session.commit()
    log_admin_action(current_user, 'BAN_USER', username, 'User banned')
    return jsonify({'message': f'User {username} has been banned.'})

@admin_bp.route('/admin/unban-user', methods=['POST'])
@admin_required
def unban_user():
    data = request.get_json()
    username = data.get('username')
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.is_banned = False
    db.session.commit()
    log_admin_action(current_user, 'UNBAN_USER', username, 'User unbanned')
    return jsonify({'message': f'User {username} has been unbanned.'})

@admin_bp.route('/news', methods=['GET'])
def get_news():
    news_items = News.query.order_by(News.created_at.desc()).limit(10).all()
    return jsonify([
        {
            'id': n.id,
            'title': n.title,
            'content': n.content,
            'created_by': User.query.get(n.created_by).username if n.created_by else 'Admin',
            'created_at': n.created_at
        } for n in news_items
    ])

@admin_bp.route('/admin/logs', methods=['GET'])
@admin_required
def get_admin_logs():
    logs = AdminActionLog.query.order_by(AdminActionLog.created_at.desc()).limit(50).all()
    user_map = {u.id: u.username for u in User.query.all()}
    return jsonify([
        {
            'admin': user_map.get(log.admin_id, 'Unknown'),
            'action_type': log.action_type,
            'target': log.target_username,
            'detail': log.detail,
            'time': log.created_at.isoformat()
        } for log in logs
    ])

@admin_bp.route('/admin/user-list', methods=['GET'])
@admin_required
def list_users():
    users = User.query.all()
    return jsonify([
        {'id': u.id, 'username': u.username, 'is_banned': u.is_banned}
        for u in users
    ])

@admin_bp.route('/user/by-username/<username>', methods=['GET'])
def get_user_by_username(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'id': user.id, 'username': user.username})

@admin_bp.route('/admin/reports/<int:report_id>/action', methods=['POST'])
@admin_required
def handle_report_action(report_id):
    action = request.json.get('action')
    if action not in ['dismiss', 'warn', 'ban']:
        return jsonify({'error': 'Invalid action'}), 400

    report = Report.query.get_or_404(report_id)
    reported_user = User.query.get_or_404(report.reported_user_id)

    if action == 'warn':
        warning = WarningMessage(
            user_id=report.reported_user_id,
            message="You have been warned for inappropriate behavior.",
            created_at=datetime.utcnow()
        )
        db.session.add(warning)
        create_notification(
            user_id=report.reported_user_id,
            message="⚠️ You received a warning for inappropriate behavior."
        )
        log_admin_action(current_user, 'WARN_USER', reported_user.username, 'Issued warning')

    elif action == 'ban':
        reported_user.is_banned = True
        create_notification(
            user_id=report.reported_user_id,
            message="🚫 You have been banned from the platform."
        )
        log_admin_action(current_user, 'BAN_USER', reported_user.username, 'User banned')

    elif action == 'dismiss':
        log_admin_action(current_user, 'DISMISS_REPORT', reported_user.username, f'Report {report.id} dismissed')

    report.status = action
    db.session.commit()

    return jsonify({
        'message': f'✅ Report {action}ed.',
        'removed_id': report.id
    })

@admin_bp.route('/admin/reports/<int:report_id>/undo', methods=['POST'])
@admin_required
def undo_report_action(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({'error': 'Report not found'}), 404

    user = User.query.get(report.reported_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if report.status == 'ban':
        user.is_banned = False
        report.status = 'pending'
        log_admin_action(current_user, 'UNDO_BAN', user.username, f'Ban reverted for report #{report.id}')
    elif report.status == 'warn':
        WarningMessage.query.filter_by(user_id=user.id).delete()
        report.status = 'pending'
        log_admin_action(current_user, 'UNDO_WARN', user.username, f'Warning removed for report #{report.id}')
    else:
        return jsonify({'error': 'Nothing to undo for this report.'}), 400

    db.session.commit()
    return jsonify({'message': 'Undo successful', 'report_id': report.id})