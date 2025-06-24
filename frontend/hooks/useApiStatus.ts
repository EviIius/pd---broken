import { useState, useEffect } from 'react';

interface ApiStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    lastChecked: null
  });
  const checkApiStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'healthy') {
          setStatus({
            isConnected: true,
            isLoading: false,
            error: null,
            lastChecked: new Date()
          });
        } else {
          setStatus({
            isConnected: false,
            isLoading: false,
            error: data.error || data.message,
            lastChecked: new Date()
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to connect to API',
        lastChecked: new Date()
      });
    }
  };
  useEffect(() => {
    // Initial check
    checkApiStatus();
    
    // Check every 60 seconds
    const interval = setInterval(checkApiStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { ...status, recheck: checkApiStatus };
}
