# models/vehicle.py
from .database import get_db_connection

class Vehicle:
    @staticmethod
    def get_by_route(route_id):
        conn = get_db_connection()
        vehicles = conn.execute('''
            SELECT * FROM vehicle_positions 
            WHERE route_id = ? AND timestamp > ?
            ORDER BY timestamp DESC
        ''', (route_id, int(time.time()) - 300)).fetchall()
        conn.close()
        return [dict(v) for v in vehicles]
    
    @staticmethod
    def get_all_active():
        conn = get_db_connection()
        vehicles = conn.execute('''
            SELECT * FROM vehicle_positions 
            WHERE timestamp > ?
            ORDER BY route_id, timestamp DESC
        ''', (int(time.time()) - 300,)).fetchall()
        conn.close()
        return [dict(v) for v in vehicles]