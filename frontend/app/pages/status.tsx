// pages/status.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import TransitStatus from '../components/TransitStatus';
import ElevatorStatus from '../components/ElevatorStatus';
import ServiceAlerts from '../components/ServiceAlerts';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Type definitions for the tabs
type ServiceTab = 'subway' | 'elevator' | 'alerts';

export default function SystemStatusPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ServiceTab>('subway');
  
  // Set active tab based on URL query parameter
  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === 'string') {
      if (['subway', 'elevator', 'alerts'].includes(tab)) {
        setActiveTab(tab as ServiceTab);
      }
    }
  }, [router.query]);
  
  // Update URL when tab changes
  const handleTabChange = (tab: ServiceTab) => {
    setActiveTab(tab);
    router.push({
      pathname: '/status',
      query: { tab }
    }, undefined, { shallow: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Head>
        <title>System Status - NYC Transit Hub</title>
        <meta name="description" content="Real-time status of all New York City transit services" />
      </Head>

      {/* Page Header */}
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                System Status
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Real-time status of all NYC transit services
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent 
                          text-sm font-medium rounded-md text-blue-700 bg-blue-100 
                          hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 
                          dark:hover:bg-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('subway')}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'subway' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
            >
              Subway Status
            </button>
            <button
              onClick={() => handleTabChange('elevator')}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'elevator' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
            >
              Elevator & Escalator Status
            </button>
            <button
              onClick={() => handleTabChange('alerts')}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'alerts' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
            >
              Service Alerts
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'subway' && (
            <div>
              <TransitStatus showAll={true} />
            </div>
          )}
          
          {activeTab === 'elevator' && (
            <div>
              <ElevatorStatus />
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <div>
              <ServiceAlerts showAll={true} groupByLine={true} />
            </div>
          )}
        </div>
      </main>
      
      {/* Line Indicator (same as in homepage) */}
      <div className="h-2 flex mt-auto">
        <div className="w-1/7 bg-blue-500"></div>
        <div className="w-1/7 bg-orange-500"></div>
        <div className="w-1/7 bg-yellow-500"></div>
        <div className="w-1/7 bg-green-500"></div>
        <div className="w-1/7 bg-purple-500"></div>
        <div className="w-1/7 bg-red-500"></div>
        <div className="w-1/7 bg-gray-500"></div>
      </div>
    </div>
  );
}