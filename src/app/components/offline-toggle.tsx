'use client';

import { useState, useEffect } from 'react';

export default function OfflineToggle() {
  const [isOnline, setIsOnline] = useState(true);
  const [isForceOffline, setIsForceOffline] = useState(false);
  const [actualBrowserStatus, setActualBrowserStatus] = useState(true);

  const applyOfflineOverride = (offline: boolean) => {
    if (offline) {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
    } else {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
    }
  };

  useEffect(() => {
    // Store the ACTUAL browser online status (before any override)
    const realStatus = navigator.onLine;
    setActualBrowserStatus(realStatus);

    // Check saved preference
    const savedMode = localStorage.getItem('forceOfflineMode');
    const shouldBeOffline = savedMode === 'true';
    
    // If browser is actually offline, ignore saved preference
    if (!realStatus) {
      setIsOnline(false);
      setIsForceOffline(false);
      localStorage.removeItem('forceOfflineMode'); // Clear any saved force offline
    } else if (shouldBeOffline) {
      // Browser is online but user wants force offline
      applyOfflineOverride(true);
      setIsForceOffline(true);
      setIsOnline(false);
    } else {
      // Browser is online and no force offline
      setIsOnline(true);
    }

    const handleOnline = () => {
      // Real browser came back online
      setActualBrowserStatus(true);
      
      // Check if force offline is still enabled
      const currentForceOffline = localStorage.getItem('forceOfflineMode') === 'true';
      if (!currentForceOffline) {
        setIsOnline(true);
      }
    };

    const handleOffline = () => {
      // Real browser went offline
      setActualBrowserStatus(false);
      setIsOnline(false);
      setIsForceOffline(false);
      localStorage.removeItem('forceOfflineMode'); // Can't force offline when actually offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleOfflineMode = () => {
    // Don't allow toggle if browser is actually offline
    if (!actualBrowserStatus) {
      return;
    }

    const newMode = !isForceOffline;
    setIsForceOffline(newMode);
    setIsOnline(!newMode);
    localStorage.setItem('forceOfflineMode', String(newMode));

    // Apply the override
    applyOfflineOverride(newMode);

    // Dispatch custom event for other components
    window.dispatchEvent(
      new CustomEvent('offlineModeChange', { 
        detail: { isOffline: newMode } 
      })
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleOfflineMode}
        disabled={!actualBrowserStatus} // Disable button when browser is actually offline
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
          transition-all duration-200 font-medium
          ${!actualBrowserStatus
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : isOnline && !isForceOffline
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
          }
        `}
        aria-label={
          !actualBrowserStatus 
            ? 'No internet connection' 
            : isOnline && !isForceOffline 
            ? 'Switch to offline mode' 
            : 'Switch to online mode'
        }
      >
        <span className="relative flex h-3 w-3">
          <span
            className={`
              animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
              ${!actualBrowserStatus
                ? 'bg-gray-300'
                : isOnline && !isForceOffline 
                ? 'bg-green-300' 
                : 'bg-red-300'
              }
            `}
          />
          <span
            className={`
              relative inline-flex rounded-full h-3 w-3
              ${!actualBrowserStatus
                ? 'bg-gray-200'
                : isOnline && !isForceOffline 
                ? 'bg-green-200' 
                : 'bg-red-200'
              }
            `}
          />
        </span>
        <span>
          {!actualBrowserStatus 
            ? '⚠️ No Connection' 
            : isForceOffline 
            ? '🔴 Offline Mode' 
            : isOnline 
            ? '🟢 Online' 
            : '⚠️ Offline'
          }
        </span>
      </button>
    </div>
  );
}