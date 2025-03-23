# models/alert.py
from .database import get_db_connection

class Alert:
    @staticmethod
    def get_all():
        conn = get_db_connection()
        alerts = conn.execute('''
            SELECT a.*, GROUP_CONCAT(ae.entity_id) as affected_entities
            FROM alerts a
            LEFT JOIN alert_entities ae ON a.id = ae.alert_id
            GROUP BY a.id
            ORDER BY a.start_time DESC
        ''').fetchall()
        conn.close()
        return [dict(a) for a in alerts]
    
    @staticmethod
    def get_by_route(route_id):
        conn = get_db_connection()
        alerts = conn.execute('''
            SELECT a.*
            FROM alerts a
            JOIN alert_entities ae ON a.id = ae.alert_id
            WHERE ae.entity_type = 'route_id' AND ae.entity_id = ?
            ORDER BY a.start_time DESC
        ''', (route_id,)).fetchall()
        conn.close()
        return [dict(a) for a in alerts]