// components/TransitStatus.tsx
"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import apiConfig from '../api/config';

// Type definitions
interface LineStatus {
  line: string;
  name: string;
  status: string;
  details: AlertDetail[];
}

interface AlertDetail {
  header: string;
  description: string;
}

interface ServiceAlert {
  id: string;
  effect: string;
  header_text: string;
  description_text: string;
  informed_entity: {
    route_id?: string;
    stop_id?: string;
  }[];
}

interface StatusResponse {
  last_update: string;
  lines_available: string[];
  alerts_available: string[];
  elevator_data_available: string[];
  total_vehicles: number;
}

interface AlertsResponse {
  header: {
    timestamp: number;
    version: string;
  };
  alerts: ServiceAlert[];
}

interface TransitStatusProps {
  showAll?: boolean;
}

// Transit line color mapping
const lineColors: Record<string, string> = {
  // Number lines
  '1': 'bg-red-500',
  '2': 'bg-red-500',
  '3': 'bg-red-500',
  '4': 'bg-green-500',
  '5': 'bg-green-500',
  '6': 'bg-green-500',
  '7': 'bg-purple-500',
  // Letter lines
  'A': 'bg-blue-600',
  'C': 'bg-blue-600',
  'E': 'bg-blue-600',
  'B': 'bg-orange-500',
  'D': 'bg-orange-500',
  'F': 'bg-orange-500',
  'M': 'bg-orange-500',
  'G': 'bg-green-400',
  'J': 'bg-brown-500',
  'Z': 'bg-brown-500',
  'L': 'bg-gray-500',
  'N': 'bg-yellow-500 text-black',
  'Q': 'bg-yellow-500 text-black',
  'R': 'bg-yellow-500 text-black',
  'W': 'bg-yellow-500 text-black',
  'S': 'bg-gray-400',
  'SI': 'bg-blue-400',
  // Default
  'default': 'bg-gray-500'
};

// Status color mapping
const statusColors: Record<string, string> = {
  'Good Service': 'text-green-600 dark:text-green-400',
  'Minor Delays': 'text-yellow-600 dark:text-yellow-400',
  'Delays': 'text-yellow-600 dark:text-yellow-400',
  'Service Change': 'text-red-600 dark:text-red-400',
  'Service Changes': 'text-red-600 dark:text-red-400',
  'Planned Work': 'text-blue-600 dark:text-blue-400',
  'No Service': 'text-red-600 dark:text-red-400',
  'default': 'text-gray-600 dark:text-gray-400'
};

// Names for subway lines
const lineNames: Record<string, string> = {
  '1': 'Broadway - 7 Avenue Local',
  '2': '7 Avenue Express',
  '3': '7 Avenue Express',
  '4': 'Lexington Avenue Express',
  '5': 'Lexington Avenue Express',
  '6': 'Lexington Avenue Local',
  '7': 'Flushing Local/Express',
  'A': '8 Avenue Express',
  'C': '8 Avenue Local',
  'E': '8 Avenue Local',
  'B': '6 Avenue Express',
  'D': '6 Avenue Express',
  'F': '6 Avenue Local',
  'M': '6 Avenue Local',
  'G': 'Brooklyn-Queens Crosstown',
  'J': 'Nassau Street Express',
  'Z': 'Nassau Street Express',
  'L': '14 Street-Canarsie Local',
  'N': 'Broadway Express',
  'Q': 'Broadway Express',
  'R': 'Broadway Local',
  'W': 'Broadway Local',
  'S': 'Shuttle Service',
  'SI': 'Staten Island Railway'
};

const TransitStatus: React.FC<TransitStatusProps> = ({ showAll = false }) => {
  const [statusData, setStatusData] = useState<LineStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch alerts data and process it
    const fetchTransitStatus = async () => {
      try {
        setLoading(true);
        
        // Fetch service alerts for subway - using the API config
        const alertsResponse = await axios.get<AlertsResponse>(apiConfig.endpoints.alerts('subway'));
        
        // Get list of available lines from status endpoint
        const statusResponse = await axios.get<StatusResponse>(apiConfig.endpoints.status);
        
        if (alertsResponse.data && statusResponse.data) {
          // Process the alerts data
          const alerts = alertsResponse.data.alerts || [];
          const availableLines = statusResponse.data.lines_available || [];
          
          // Create a map to store status for each line
          const lineStatusMap: Record<string, LineStatus> = {};
          
          // Initialize all available lines with "Good Service"
          availableLines.forEach(line => {
            lineStatusMap[line] = {
              line,
              name: lineNames[line] || `Line ${line}`,
              status: 'Good Service',
              details: []
            };
          });
          
          // Update with actual alerts
          alerts.forEach(alert => {
            // Get affected lines
            const affectedLines: string[] = [];
            alert.informed_entity.forEach(entity => {
              if (entity.route_id && availableLines.includes(entity.route_id)) {
                affectedLines.push(entity.route_id);
              }
            });
            
            // Update status for affected lines
            affectedLines.forEach(line => {
              if (lineStatusMap[line]) {
                // Determine status based on alert effect
                let status = 'Service Changes';
                switch (alert.effect) {
                  case 'NO_SERVICE':
                    status = 'No Service';
                    break;
                  case 'REDUCED_SERVICE':
                  case 'SIGNIFICANT_DELAYS':
                    status = 'Delays';
                    break;
                  case 'DETOUR':
                  case 'ADDITIONAL_SERVICE':
                  case 'MODIFIED_SERVICE':
                    status = 'Service Changes';
                    break;
                  case 'MINOR_DELAYS':
                    status = 'Minor Delays';
                    break;
                  case 'PLANNED':
                    status = 'Planned Work';
                    break;
                  default:
                    status = 'Service Changes';
                }
                
                lineStatusMap[line].status = status;
                lineStatusMap[line].details.push({
                  header: alert.header_text,
                  description: alert.description_text
                });
              }
            });
          });
          
          // Convert map to array and sort by line
          const statusArray = Object.values(lineStatusMap).sort((a, b) => {
            // Sort numerically first, then alphabetically
            const aIsNum = !isNaN(parseInt(a.line));
            const bIsNum = !isNaN(parseInt(b.line));
            
            if (aIsNum && bIsNum) {
              return parseInt(a.line) - parseInt(b.line);
            } else if (aIsNum) {
              return -1;
            } else if (bIsNum) {
              return 1;
            } else {
              return a.line.localeCompare(b.line);
            }
          });
          
          setStatusData(statusArray);
          setLastUpdated(new Date().toLocaleString());
        }
      } catch (err) {
        console.error('Error fetching transit status:', err);
        setError('Failed to load transit status. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransitStatus();
    
    // Set up polling interval (every 60 seconds)
    const interval = setInterval(fetchTransitStatus, 60000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);
  
  // Get line color class
  const getLineColorClass = (line: string): string => {
    return lineColors[line] || lineColors['default'];
  };
  
  // Get status color class
  const getStatusColorClass = (status: string): string => {
    return statusColors[status] || statusColors['default'];
  };
  
  // Determine how many lines to show
  const displayData = showAll ? statusData : statusData.slice(0, 4);
  
  if (loading && statusData.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading transit status...</p>
      </div>
    );
  }
  
  if (error && statusData.length === 0) {
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Subway Line Status
          </h3>
          {lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Updated: {lastUpdated}
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          {displayData.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transit status data available</p>
          ) : (
            displayData.map((line) => (
              <div key={line.line} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-full ${getLineColorClass(line.line)} text-white flex items-center justify-center font-bold`}>
                    {line.line}
                  </span>
                  <span className="text-gray-900 dark:text-white">{line.name}</span>
                </div>
                <span className={getStatusColorClass(line.status)}>
                  {line.status}
                </span>
              </div>
            ))
          )}
        </div>
        
        {!showAll && statusData.length > 4 && (
          <div className="mt-6 text-center">
            <Link 
              href="/status" 
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              View Complete System Status
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransitStatus;