# === __init__.py (finalized) ===
from flask import Flask, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_mail import Mail
from flask_login import LoginManager
from dotenv import load_dotenv
import os
from datetime import timedelta

from .anime_fetcher import fetch_and_store_anime
from Backend.models import db, User
from Backend.extensions import db, bcrypt

mail = Mail()

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object('config.Config')

    # === Core App Config ===
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'supersecretkey')
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # === Session and Cookie Fixes ===
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False  # Set True only in production with HTTPS
    app.config['SESSION_COOKIE_DOMAIN'] = 'localhost'

    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    # CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])
    CORS(app, supports_credentials=True, origins=[
    "https://anime-forum-tsx-wrrp-b0oe79tdx-levans-projects-c3e8f329.vercel.app"])

    from .routes.debug import debug_bp
    app.register_blueprint(debug_bp)

    login_manager = LoginManager()
    login_manager.init_app(app)
    app.login_manager = login_manager
    login_manager.login_view = "auth.login"
    login_manager.login_message_category = 'info'

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({"error": "Unauthorized"}), 401

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @app.before_request
    def make_session_permanent():
        session.permanent = True

    from .routes.anime import anime_bp
    from .routes.auth import auth_bp
    from .routes.review import review_bp
    from .routes.home import home_bp
    from .routes.collection import collection_bp
    from .routes.comment import comment_bp
    from .routes.password_reset import password_reset_bp
    from .routes.profile import profile_bp
    from .routes.forum import forum_bp
    from .routes.notifications import notifications_bp
    from .routes.feedback import feedback_bp
    from .routes.admin import admin_bp
    from .routes.report import report_bp
    from .routes.friendship import friendship_bp
    from .routes.search import search_bp
    
    from .routes.test_mail import mail_debug_bp #############
    app.register_blueprint(mail_debug_bp)

    app.register_blueprint(home_bp)
    app.register_blueprint(anime_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(review_bp)
    app.register_blueprint(collection_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(password_reset_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(forum_bp, url_prefix='/api/forum')
    app.register_blueprint(notifications_bp)
    app.register_blueprint(feedback_bp, url_prefix='/feedback')
    app.register_blueprint(admin_bp)  
    app.register_blueprint(report_bp)
    app.register_blueprint(friendship_bp)
    app.register_blueprint(search_bp)

    print("\n🔧 REGISTERED ROUTES:")
    for rule in app.url_map.iter_rules():
        print(f"📍 {rule.endpoint}: {rule}")

    @app.cli.command("fetch-anime")
    def fetch_anime_command():
        with app.app_context():
            fetch_and_store_anime(pages=100, delay=1)

    @app.shell_context_processor
    def make_shell_context():
        from .models import db, User, Anime, Review
        return {'db': db, 'User': User, 'Anime': Anime, 'Review': Review}

    return app


