# routes/alerts.py
from flask import Blueprint, jsonify, request
from models.alert import Alert

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/api/alerts', methods=['GET'])
def get_alerts():
    route_id = request.args.get('route')
    if route_id:
        alerts = Alert.get_by_route(route_id)
    else:
        alerts = Alert.get_all()
    return jsonify(alerts)