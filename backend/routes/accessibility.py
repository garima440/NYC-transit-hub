# routes/accessibility.py
from flask import Blueprint, jsonify, request
from models.accessibility import Accessibility

accessibility_bp = Blueprint('accessibility', __name__)

@accessibility_bp.route('/api/accessibility/equipment', methods=['GET'])
def get_equipment():
    station_id = request.args.get('station')
    if station_id:
        equipment = Accessibility.get_by_station(station_id)
    else:
        equipment = Accessibility.get_equipment()
    return jsonify(equipment)

@accessibility_bp.route('/api/accessibility/outages', methods=['GET'])
def get_outages():
    outages = Accessibility.get_outages()
    return jsonify(outages)