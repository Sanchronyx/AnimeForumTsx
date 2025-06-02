from flask import Blueprint, jsonify
from flask_login import current_user

debug_bp = Blueprint('debug', __name__)

@debug_bp.route("/whoami")
def whoami():
    if current_user.is_authenticated:
        return jsonify({"authenticated": True, "username": current_user.username, "id": current_user.id})
    else:
        return jsonify({"authenticated": False})
