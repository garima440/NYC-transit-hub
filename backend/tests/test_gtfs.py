import sys
import os
# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from services.gtfs_service import GTFSService

def test_gtfs_service():
    print("Testing GTFS Service...")
    
    # Test subway positions
    print("\n1. Testing subway positions...")
    vehicles = GTFSService.update_subway_positions()
    print(f"   Added {vehicles} vehicle positions")
    
    # Test trip updates
    print("\n2. Testing trip updates...")
    trips, stops = GTFSService.update_trip_updates()
    print(f"   Added {trips} trip updates and {stops} stop time updates")
    
    # Test alerts
    print("\n3. Testing alerts...")
    alerts, entities = GTFSService.update_alerts()
    print(f"   Added {alerts} alerts affecting {entities} entities")
    
    # Test accessibility data
    print("\n4. Testing accessibility data...")
    outages = GTFSService.update_accessibility()
    print(f"   Added {outages} accessibility outages")
    
    print("\nAll tests completed!")

if __name__ == "__main__":
    test_gtfs_service()