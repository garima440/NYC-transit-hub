// components/ServiceAlerts.tsx
"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../api/config';

// Type definitions
interface ServiceAlert {
  id: string;
  effect: string;
  header_text: string;
  description_text: string;
  active_period: {
    start: number;
    end: number | null;
  }[];
  informed_entity: {
    route_id?: string;
    stop_id?: string;
  }[];
}

interface AlertsResponse {
  header: {
    timestamp: number;
    version: string;
  };
  alerts: ServiceAlert[];
}

interface ServiceAlertsProps {
  limit?: number;
  groupByLine?: boolean;
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

// Alert effect mapping to user-friendly terms
const effectLabels: Record<string, { text: string; colorClass: string }> = {
  'NO_SERVICE': { 
    text: 'No Service', 
    colorClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
  },
  'REDUCED_SERVICE': { 
    text: 'Reduced Service', 
    colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
  },
  'SIGNIFICANT_DELAYS': { 
    text: 'Significant Delays', 
    colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
  },
  'DETOUR': { 
    text: 'Detour', 
    colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' 
  },
  'ADDITIONAL_SERVICE': { 
    text: 'Additional Service', 
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
  },
  'MODIFIED_SERVICE': { 
    text: 'Modified Service', 
    colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' 
  },
  'MINOR_DELAYS': { 
    text: 'Minor Delays', 
    colorClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
  },
  'PLANNED': { 
    text: 'Planned Work', 
    colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
  },
  'UNKNOWN_EFFECT': { 
    text: 'Service Change', 
    colorClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' 
  }
};

const ServiceAlerts: React.FC<ServiceAlertsProps> = ({ limit, groupByLine = true, showAll = false }) => {
  const [alertsData, setAlertsData] = useState<ServiceAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchServiceAlerts = async () => {
      try {
        setLoading(true);
        
        // Fetch service alerts data
        const response = await axios.get<AlertsResponse>(apiConfig.endpoints.alerts('subway'));
        
        if (response.data && response.data.alerts) {
          // Sort alerts by effect severity
          const sortedAlerts = [...response.data.alerts].sort((a, b) => {
            // Prioritize NO_SERVICE and SIGNIFICANT_DELAYS first
            const severityOrder: Record<string, number> = {
              'NO_SERVICE': 1,
              'SIGNIFICANT_DELAYS': 2,
              'REDUCED_SERVICE': 3,
              'DETOUR': 4,
              'MODIFIED_SERVICE': 5,
              'MINOR_DELAYS': 6,
              'PLANNED': 7,
              'ADDITIONAL_SERVICE': 8
            };
            
            const aOrder = severityOrder[a.effect] || 99;
            const bOrder = severityOrder[b.effect] || 99;
            
            return aOrder - bOrder;
          });
          
          setAlertsData(sortedAlerts);
          setLastUpdated(new Date(response.data.header.timestamp * 1000).toLocaleString());
        }
      } catch (err) {
        console.error('Error fetching service alerts:', err);
        setError('Failed to load service alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceAlerts();
    
    // Set up polling interval (every 2 minutes)
    const interval = setInterval(fetchServiceAlerts, 120000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);
  
  // Get alert effect label and color
  const getEffectInfo = (effect: string): { text: string; colorClass: string } => {
    return effectLabels[effect] || effectLabels['UNKNOWN_EFFECT'];
  };
  
  // Get line color class
  const getLineColorClass = (line: string): string => {
    return lineColors[line] || lineColors['default'];
  };
  
  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  // Determine how many alerts to display
  const displayData = showAll 
    ? alertsData 
    : (limit ? alertsData.slice(0, limit) : alertsData);
  
  // Function to group alerts by line
  const groupAlertsByLine = (alerts: ServiceAlert[]): Record<string, ServiceAlert[]> => {
    const grouped: Record<string, ServiceAlert[]> = {};
    
    alerts.forEach(alert => {
      const affectedLines: string[] = [];
      
      // Collect all affected lines from the alert
      alert.informed_entity.forEach(entity => {
        if (entity.route_id && !affectedLines.includes(entity.route_id)) {
          affectedLines.push(entity.route_id);
        }
      });
      
      // Add alert to each affected line's group
      affectedLines.forEach(line => {
        if (!grouped[line]) {
          grouped[line] = [];
        }
        grouped[line].push(alert);
      });
      
      // If no specific lines are mentioned, add to a "General" category
      if (affectedLines.length === 0) {
        if (!grouped['General']) {
          grouped['General'] = [];
        }
        grouped['General'].push(alert);
      }
    });
    
    return grouped;
  };
  
  // Group alerts by line if requested
  const groupedAlerts = groupByLine ? groupAlertsByLine(displayData) : null;
  
  if (loading && alertsData.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading service alerts...</p>
      </div>
    );
  }
  
  if (error && alertsData.length === 0) {
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
            Service Alerts
          </h3>
          {lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Updated: {lastUpdated}
            </span>
          )}
        </div>
        
        {alertsData.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">Good Service</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">All subway lines are currently operating normally.</p>
          </div>
        ) : groupByLine ? (
          // Grouped by line view
          <div className="space-y-6">
            {Object.entries(groupedAlerts || {}).map(([line, alerts]) => (
              <div key={line} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-700">
                  {line !== 'General' ? (
                    <span className={`flex-shrink-0 w-10 h-10 rounded-full ${getLineColorClass(line)} text-white flex items-center justify-center font-bold mr-3`}>
                      {line}
                    </span>
                  ) : (
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  )}
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {line === 'General' ? 'System-Wide Alerts' : `Line ${line} Alerts`}
                  </h4>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {alerts.map((alert) => {
                    const { text: effectText, colorClass } = getEffectInfo(alert.effect);
                    return (
                      <div key={alert.id} className="p-4">
                        <div className="flex items-start">
                          <span className={`px-2 py-1 text-xs font-medium rounded-md ${colorClass} mr-3 mt-1`}>
                            {effectText}
                          </span>
                          <div>
                            <h5 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                              {alert.header_text}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                              {alert.description_text}
                            </p>
                            {alert.active_period && alert.active_period.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <p>
                                  <span className="font-medium">Start:</span> {formatTimestamp(alert.active_period[0].start)}
                                  {alert.active_period[0].end && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span className="font-medium">End:</span> {formatTimestamp(alert.active_period[0].end)}
                                    </>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat list view
          <div className="space-y-4">
            {displayData.map((alert) => {
              const { text: effectText, colorClass } = getEffectInfo(alert.effect);
              
              // Get affected lines
              const affectedLines = alert.informed_entity
                .filter(entity => entity.route_id)
                .map(entity => entity.route_id);
              
              return (
                <div key={alert.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${colorClass} mr-3 mt-1`}>
                      {effectText}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {affectedLines.map(line => (
                          <span 
                            key={`${alert.id}-${line}`}
                            className={`flex-shrink-0 w-6 h-6 rounded-full ${getLineColorClass(line || '')} text-white flex items-center justify-center text-xs font-bold`}
                          >
                            {line}
                          </span>
                        ))}
                      </div>
                      <h5 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                        {alert.header_text}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                        {alert.description_text}
                      </p>
                      {alert.active_period && alert.active_period.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <p>
                            <span className="font-medium">Start:</span> {formatTimestamp(alert.active_period[0].start)}
                            {alert.active_period[0].end && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="font-medium">End:</span> {formatTimestamp(alert.active_period[0].end)}
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {limit && alertsData.length > limit && (
          <div className="mt-6 text-center">
            <a 
              href="/status?tab=alerts" 
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              View All Service Alerts
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

export default ServiceAlerts;