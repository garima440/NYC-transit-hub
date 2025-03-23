# models/accessibility.py
from .database import get_db_connection

class Accessibility:
    @staticmethod
    def get_equipment():
        conn = get_db_connection()
        equipment = conn.execute('SELECT * FROM accessibility_equipment').fetchall()
        conn.close()
        return [dict(e) for e in equipment]
    
    @staticmethod
    def get_outages():
        conn = get_db_connection()
        outages = conn.execute('''
            SELECT o.*, e.station_id, e.equipment_type, e.location, e.serving
            FROM accessibility_outages o
            JOIN accessibility_equipment e ON o.equipment_id = e.equipment_id
            WHERE o.is_upcoming = 0
            ORDER BY o.outage_start DESC
        ''').fetchall()
        conn.close()
        return [dict(o) for o in outages]
    
    @staticmethod
    def get_by_station(station_id):
        conn = get_db_connection()
        equipment = conn.execute('''
            SELECT e.*, 
                   (SELECT COUNT(*) FROM accessibility_outages o 
                    WHERE o.equipment_id = e.equipment_id AND o.is_upcoming = 0) as outage_count
            FROM accessibility_equipment e
            WHERE e.station_id = ?
        ''', (station_id,)).fetchall()
        conn.close()
        return [dict(e) for e in equipment]