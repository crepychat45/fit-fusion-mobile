import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ProgressiveEnhancementProps {
  children: React.ReactNode;
}

export function ProgressiveEnhancement({ children }: ProgressiveEnhancementProps) {
  const [jsEnabled, setJsEnabled] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);

  useEffect(() => {
    setJsEnabled(true);

    // Check connection speed
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        const checkConnection = () => {
          setSlowConnection(
            conn.effectiveType === 'slow-2g' || 
            conn.effectiveType === '2g' || 
            conn.saveData
          );
        };
        
        checkConnection();
        conn.addEventListener('change', checkConnection);
        
        return () => conn.removeEventListener('change', checkConnection);
      }
    }
  }, []);

  if (!jsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>JavaScript Required</AlertTitle>
          <AlertDescription>
            This application requires JavaScript to function properly. 
            Please enable JavaScript in your browser settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {slowConnection && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 p-2 text-center text-sm text-yellow-800 dark:text-yellow-200">
          Slow connection detected. Some features may load slowly.
        </div>
      )}
      {children}
    </>
  );
}
