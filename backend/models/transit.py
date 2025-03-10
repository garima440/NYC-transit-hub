from app import db
from datetime import datetime

class Route(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # subway, bus, etc.
    color = db.Column(db.String(20))
    status = db.Column(db.String(50), default="normal")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "color": self.color,
            "status": self.status
        }

class Station(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": {
                "lat": self.latitude,
                "lng": self.longitude
            }
        }
