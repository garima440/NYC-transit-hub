# backend/config/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# No API key needed - MTA APIs are public
API_BASE_URL = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/'
REFRESH_INTERVAL = 60  # seconds

# Define subway line feed mappings
SUBWAY_FEEDS = {
    'ace': 'nyct%2Fgtfs-ace',        # A, C, E lines
    'g': 'nyct%2Fgtfs-g',            # G line
    'nqrw': 'nyct%2Fgtfs-nqrw',      # N, Q, R, W lines
    'bdfm': 'nyct%2Fgtfs-bdfm',      # B, D, F, M lines
    'jz': 'nyct%2Fgtfs-jz',          # J, Z lines
    'l': 'nyct%2Fgtfs-l',            # L line
    'si': 'nyct%2Fgtfs-si',          # Staten Island Railway
    '123456s': 'nyct%2Fgtfs'         # 1, 2, 3, 4, 5, 6, S lines
}

# Other feeds
LIRR_FEED = 'lirr%2Fgtfs-lirr'
MNR_FEED = 'mnr%2Fgtfs-mnr'

# Service alerts
SERVICE_ALERTS = {
    'all': 'camsys%2Fall-alerts',
    'subway': 'camsys%2Fsubway-alerts',
    'bus': 'camsys%2Fbus-alerts',
    'lirr': 'camsys%2Flirr-alerts',
    'mnr': 'camsys%2Fmnr-alerts'
}

# Elevator and escalator feeds
ELEVATOR_FEEDS = {
    'current': 'nyct%2Fnyct_ene',
    'upcoming': 'nyct%2Fnyct_ene_upcoming',
    'equipment': 'nyct%2Fnyct_ene_equipments'
}