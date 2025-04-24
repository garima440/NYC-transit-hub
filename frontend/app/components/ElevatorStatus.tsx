// components/ElevatorStatus.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../api/config';

// Type definitions
interface Equipment {
  equipmentno?: string;
  equipment?: string; // Added this field based on actual API response
  station?: string;
  borough?: string;
  trainno?: string;
  equipmenttype?: string;
  serving?: string;
  ADA?: string;
  outagedate?: string;
  estimatedreturntoservice?: string;
  reason?: string;
  isupcomingoutage?: string;
  ismaintenanceoutage?: string;
  serviceoutage?: string;
  [key: string]: string | undefined;
}

// The API either returns an array directly or an object with equipments array
type ElevatorStatusResponse = Equipment[] | { equipments: Equipment[] };

interface ElevatorStatusProps {
  limit?: number;
}

// Equipment status colors
const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Planned Work': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Repair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Outage': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'default': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
};

// Borough abbreviations to full names
const boroughNames: Record<string, string> = {
  'M': 'Manhattan',
  'BX': 'Bronx',
  'BK': 'Brooklyn',
  'Q': 'Queens',
  'SI': 'Staten Island'
};

// Train line to borough mapping
const trainLineToBorough: Record<string, string> = {
  '1': 'Manhattan',
  '2': 'Manhattan', 
  '3': 'Manhattan',
  '4': 'Manhattan',
  '5': 'Bronx',
  '6': 'Bronx',
  '7': 'Queens',
  'A': 'Manhattan',
  'C': 'Manhattan',
  'E': 'Queens',
  'B': 'Manhattan',
  'D': 'Bronx',
  'F': 'Queens',
  'M': 'Queens',
  'G': 'Brooklyn',
  'J': 'Brooklyn',
  'Z': 'Queens',
  'L': 'Manhattan',
  'N': 'Manhattan',
  'Q': 'Manhattan',
  'R': 'Queens',
  'W': 'Manhattan',
  'S': 'Manhattan',
  'SI': 'Staten Island'
};

const ElevatorStatus: React.FC<ElevatorStatusProps> = ({ limit }) => {
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchElevatorStatus = async () => {
      try {
        setLoading(true);
        
        // Log the URL for debugging
        console.log('Fetching from:', apiConfig.endpoints.elevator('current'));
        
        // Fetch elevator status data
        const response = await axios.get<ElevatorStatusResponse>(apiConfig.endpoints.elevator('current'));
        
        console.log('API Response:', response);
        
        // Process equipment data - handle both array and object with equipments property
        let equipments: Equipment[] = [];
        
        if (Array.isArray(response.data)) {
          equipments = response.data;
        } else if (response.data && 'equipments' in response.data) {
          equipments = response.data.equipments;
        }
        
        console.log('Processed equipment data:', equipments.length, 'items');
        
        if (equipments.length > 0) {
          // Sort by status (outages first) and then by station name
          const sortedEquipments = [...equipments].sort((a, b) => {
            // Check for actual outage vs. future outage
            const aIsOutage = a.isupcomingoutage !== 'Y' && (a.serviceoutage === 'True' || a.ismaintenanceoutage === 'Y');
            const bIsOutage = b.isupcomingoutage !== 'Y' && (b.serviceoutage === 'True' || b.ismaintenanceoutage === 'Y');
            
            // Sort outages first
            if (aIsOutage && !bIsOutage) return -1;
            if (!aIsOutage && bIsOutage) return 1;
            
            // Then sort by station name
            return (a.station || '').localeCompare(b.station || '');
          });
          
          setEquipmentData(sortedEquipments);
          setLastUpdated(new Date().toLocaleString());
        } else {
          // Use mock data if no equipment found
          console.warn('No equipment data found, using mock data');
          const mockData: Equipment[] = [
            {
              equipment: "EL123",
              station: "Times Square",
              borough: "M",
              trainno: "1,2,3,N,Q,R",
              equipmenttype: "EL",
              serving: "Mezzanine to Platform",
              ADA: "True",
              serviceoutage: "False"
            },
            {
              equipment: "ES456",
              station: "Grand Central",
              borough: "M",
              trainno: "4,5,6,7,S",
              equipmenttype: "ES",
              serving: "Street to Mezzanine",
              ADA: "True",
              serviceoutage: "True",
              outagedate: "2023-04-15",
              estimatedreturntoservice: "2023-04-30"
            }
          ];
          setEquipmentData(mockData);
          setLastUpdated("MOCK DATA: " + new Date().toLocaleString());
        }
      } catch (err) {
        console.error('Error fetching elevator status:', err);
        setError('Failed to load elevator status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchElevatorStatus();
    
    // Set up polling interval (every 5 minutes)
    const interval = setInterval(fetchElevatorStatus, 300000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);
  
  // Get status text and color based on equipment information
  const getStatusInfo = (equipment: Equipment): { text: string; colorClass: string } => {
    if (equipment.serviceoutage === 'True' || (equipment.ismaintenanceoutage === 'Y' && equipment.isupcomingoutage !== 'Y')) {
      return { 
        text: 'Outage', 
        colorClass: statusColors['Outage']
      };
    } else if (equipment.isupcomingoutage === 'Y' || equipment.isupcomingoutage === 'True') {
      return { 
        text: 'Planned Work',
        colorClass: statusColors['Planned Work'] 
      };
    } else if (equipment.reason && equipment.reason.includes('repair')) {
      return { 
        text: 'Repair',
        colorClass: statusColors['Repair']
      };
    } else {
      return { 
        text: 'Active',
        colorClass: statusColors['Active']
      };
    }
  };
  
  // Get full borough name - infer from station name or train lines if not provided
  const getBorough = (equipment: Equipment): string => {
    // If borough code is provided and not empty, use it
    if (equipment.borough && equipment.borough !== "") {
      return boroughNames[equipment.borough] || equipment.borough;
    }
    
    // Try to infer from station name
    const station = equipment.station || '';
    if (station.includes("St") && station.includes("Manhattan")) {
      return "Manhattan";
    } else if (station.includes("Bronx")) {
      return "Bronx";
    } else if (station.includes("Brooklyn")) {
      return "Brooklyn";
    } else if (station.includes("Queens")) {
      return "Queens";
    } else if (station.includes("Staten Island")) {
      return "Staten Island";
    }
    
    // Try to infer from train lines
    const trainLines = equipment.trainno?.split('/') || [];
    if (trainLines.length > 0) {
      // Get the primary train line
      const primaryLine = trainLines[0].trim();
      // If it's a known line with a borough, use that
      for (const line of trainLines) {
        const cleanLine = line.trim();
        if (trainLineToBorough[cleanLine]) {
          return trainLineToBorough[cleanLine];
        }
      }
    }
    
    // Use station name patterns to guess
    if (station.includes("Times Sq") || station.includes("Grand Central") || 
        station.includes("Penn Station") || station.includes("Union Sq")) {
      return "Manhattan";
    } else if (station.includes("Coney Island") || station.includes("Atlantic Av")) {
      return "Brooklyn";
    } else if (station.includes("Jamaica") || station.includes("Sutphin")) {
      return "Queens";
    } else if (station.includes("Yankee Stadium")) {
      return "Bronx";
    }
    
    // Default
    return "NYC";
  };
  
  // Get equipment ID from either field
  const getEquipmentId = (equipment: Equipment): string => {
    return equipment.equipmentno || equipment.equipment || 'Unknown';
  };
  
  // Limit the number of items if specified
  const displayData = limit ? equipmentData.slice(0, limit) : equipmentData;
  
  if (loading && equipmentData.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading elevator status...</p>
      </div>
    );
  }
  
  if (error && equipmentData.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Elevator & Escalator Status
          </h3>
          {lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Updated: {lastUpdated}
            </span>
          )}
        </div>
        
        {displayData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No elevator or escalator status data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Station
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Borough
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Serving
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Return to Service
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-gray-700">
                {displayData.map((equipment, index) => {
                  const { text: statusText, colorClass } = getStatusInfo(equipment);
                  return (
                    <tr key={`${getEquipmentId(equipment)}-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-700/50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {equipment.station || 'Unknown Station'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {getBorough(equipment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {equipment.equipmenttype === 'EL' ? 'Elevator' : 
                         equipment.equipmenttype === 'ES' ? 'Escalator' : 
                         equipment.equipmenttype || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {equipment.serving || 'Not specified'}
                        {equipment.ADA === 'Y' || equipment.ADA === 'True' ? (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            ADA
                          </span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {equipment.estimatedreturntoservice || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {limit && equipmentData.length > limit && (
          <div className="mt-6 text-center">
            <a 
              href="/status?tab=elevator" 
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              View All Elevator & Escalator Status
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElevatorStatus;