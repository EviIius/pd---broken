"use client"

import { useApiStatus } from '../hooks/useApiStatus';
import { CheckCircle, XCircle, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function PlatformHeader() {
  const { isConnected, isLoading, error, lastChecked } = useApiStatus();
  const [showTooltip, setShowTooltip] = useState(false);
  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-2 w-2 animate-spin text-blue-300" />;
    }
    if (isConnected) {
      return <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>;
    }
    return <div className="h-2 w-2 bg-red-400 rounded-full"></div>;
  };

  const getStatusText = () => {
    if (isLoading) return "Checking...";
    if (isConnected) return "Online";
    return "Offline";
  };

  const getStatusColor = () => {
    if (isLoading) return "bg-blue-500";
    if (isConnected) return "bg-green-500";
    return "bg-red-500";
  };
  const formatLastChecked = () => {
    if (!lastChecked) return "Never";
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return lastChecked.toLocaleString('en-US', options);
  };

  return (
    <div className="w-full">
      <div className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3 relative">
          <div 
            className="cursor-help relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <h1 className="text-2xl font-bold tracking-wide flex items-center space-x-2">
              <span>Re-Gent</span>
              <div className="flex items-center space-x-1 text-xs">
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </div>
            </h1>
            
            {/* Custom Tooltip - matches the screenshot design */}
            {showTooltip && (
              <div className="absolute top-full left-0 mt-2 bg-white text-gray-800 border border-gray-200 shadow-xl rounded-lg p-4 w-80 z-50">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Re-Gent - Regulatory Intelligence Assistant</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Intelligent policy document search and Q&A system
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p>Ask questions about federal banking regulations and get AI-powered responses with source citations and confidence scores.</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        API Connected
                      </span>
                    </div>                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.reload();
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 px-2 py-1 rounded flex items-center space-x-1 hover:bg-gray-50 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Last checked: {formatLastChecked()}</p>
                    {error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                        <p className="font-medium">Error:</p>
                        <p>{error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-6">          {/* Navigation Links */}
          <nav className="flex items-center space-x-4 text-sm">
            <a href="/" className="hover:underline hover:text-blue-200 transition-colors">Home</a>
            <a href="/policy-qa" className="hover:underline hover:text-blue-200 transition-colors">Policy Q&A</a>
            <a href="/excel" className="hover:underline hover:text-blue-200 transition-colors">Excel Analysis</a>
            <a href="/document-analyzer" className="hover:underline hover:text-blue-200 transition-colors">Document Analyzer</a>
          </nav>
          
          {/* Account Section */}
          <div className="flex items-center space-x-2 text-sm border-l border-blue-500 pl-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-semibold">
              U
            </div>
            <a href="#" className="hover:underline hover:text-blue-200 transition-colors">Account</a>
          </div>
        </div>
      </div>
      <div className={`h-1 ${getStatusColor()}`}></div>
    </div>
  );
}
