// pages/planner.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function PlannerComingSoon() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <Head>
        <title>Trip Planner - Coming Soon | NYC Transit Hub</title>
        <meta name="description" content="Our advanced trip planning tool is currently in development" />
      </Head>

      {/* Header with navigation */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">NYC Transit Hub</Link>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><Link href="/" className="text-white hover:text-blue-100 transition-colors">Home</Link></li>
              <li><Link href="/status?tab=alerts" className="text-white hover:text-blue-100 transition-colors">Service Status</Link></li>
              <li><Link href="/transit-map" className="text-white hover:text-blue-100 transition-colors">Maps</Link></li>
            </ul>
          </nav>
        </div>
        
        {/* Transit Line Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-2 flex">
          <div className="w-1/7 bg-blue-500"></div>
          <div className="w-1/7 bg-orange-500"></div>
          <div className="w-1/7 bg-yellow-500"></div>
          <div className="w-1/7 bg-green-500"></div>
          <div className="w-1/7 bg-purple-500"></div>
          <div className="w-1/7 bg-red-500"></div>
          <div className="w-1/7 bg-gray-500"></div>
        </div>
      </header>

      {/* Coming Soon Content */}
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 mb-6">
                Coming Q3 2025
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Advanced Trip Planning<br />
                <span className="text-blue-600 dark:text-blue-400">Under Development</span>
              </h1>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                Our engineering team is building a comprehensive trip planning tool powered by real-time data and advanced algorithms to optimize your NYC transit experience.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-500 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">Real-time predictions and service disruption routing</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-500 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">Accessibility options and station facility information</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-green-500 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700 dark:text-gray-300">Multi-modal trip options including bus, subway, ferry, and Citi Bike</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Return to Home
                </Link>
                <Link
                  href="/status?tab=alerts"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  View Service Status
                </Link>
              </div>
              
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Subscribe to our newsletter to receive updates when this feature goes live.
                </p>
              </div>
            </div>
            
            <div className="hidden md:block relative h-96">
              <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-100 dark:text-blue-800">
                    <path fill="currentColor" d="M44.9,-76.2C58.2,-69.3,69.2,-58,78.1,-44.4C87,-30.8,93.9,-15.4,94.1,0.1C94.3,15.6,87.9,31.2,79.2,45.6C70.5,60,59.6,73.3,45.7,81.6C31.8,89.9,15.9,93.3,0,93.2C-15.8,93.1,-31.6,89.5,-44.6,81.3C-57.5,73.1,-67.5,60.3,-74.3,45.9C-81.1,31.5,-84.6,15.8,-84.8,-0.1C-85.1,-16,-82,-32,-74.1,-45.6C-66.2,-59.2,-53.4,-70.3,-39.4,-76.8C-25.3,-83.3,-12.7,-85.1,1.2,-87.3C15.1,-89.4,30.2,-91.8,44.9,-85.8Z" transform="translate(100 100)" />
                  </svg>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                        <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-xs text-gray-500">nyctransithub.app</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-10 bg-blue-100 dark:bg-blue-900 rounded"></div>
                        <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg w-full"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 w-6 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                        <div className="h-6 flex-1 bg-gray-100 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="bg-gray-800 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg mb-4">NYC Transit Hub</h3>
            <p className="text-gray-300 text-sm">
              Your essential companion for navigating New York City's transportation system.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/maps" className="text-gray-300 hover:text-white transition-colors">Maps</Link></li>
              <li><Link href="/fares" className="text-gray-300 hover:text-white transition-colors">Fares & Passes</Link></li>
              <li><Link href="/accessibility" className="text-gray-300 hover:text-white transition-colors">Accessibility</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/status" className="text-gray-300 hover:text-white transition-colors">Service Status</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 max-w-7xl mx-auto">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} NYC Transit Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}