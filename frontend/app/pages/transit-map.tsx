// frontend/app/pages/transit-map.tsx
'use client';

import React, { useEffect, useState } from 'react';

import { getDataStatus, StatusData } from '../lib/api';
import { STATUS_REFRESH_INTERVAL } from '../lib/constants';
import '../styles/map.css';

const TransitMapPage: React.FC = () => {
  const [dataStatus, setDataStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async (): Promise<void> => {
      try {
        setLoading(true);
        const status = await getDataStatus();
        setDataStatus(status);
      } catch (error) {
        console.error('Error checking data status:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial status check
    checkStatus();
    
    // Set up polling for status updates
    const interval = setInterval(checkStatus, STATUS_REFRESH_INTERVAL);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">NYC Transit Map</h1>
      
      {dataStatus && (
        <div className="status-bar mb-4 text-sm text-gray-600">
          Last updated: {new Date(dataStatus.last_update).toLocaleTimeString()}
          {dataStatus.lines_available && dataStatus.lines_available.length > 0 && (
            <span className="ml-4">
              Available lines: {dataStatus.lines_available.join(', ')}
            </span>
          )}
        </div>
      )}
      
      
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About This Map</h2>
        <p>
          This map displays real-time information for NYC subway lines. Data is refreshed every 60 seconds
          from the MTA's real-time feeds. Click on a train to see more information about its status and any
          service alerts.
        </p>
        <p className="mt-2">
          Use the filter controls below the map to select which transit types to display.
        </p>
      </div>
    </div>
  );
};

export default TransitMapPage;