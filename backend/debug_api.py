import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from services.gtfs_service import GTFSService

if __name__ == "__main__":
    print("Starting API debug...")
    GTFSService.debug_json_feeds()
    print("Debug complete. Check the 'debug' folder for results.")