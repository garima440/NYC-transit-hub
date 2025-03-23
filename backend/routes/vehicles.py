# routes/vehicles.py
from flask import Blueprint, jsonify, request
from models.vehicle import Vehicle

vehicles_bp = Blueprint('vehicles', __name__)

@vehicles_bp.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    route_id = request.args.get('route')
    if route_id:
        vehicles = Vehicle.get_by_route(route_id)
    else:
        vehicles = Vehicle.get_all_active()
    return jsonify(vehicles)