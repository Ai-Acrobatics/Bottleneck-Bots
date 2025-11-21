import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Timer hook with auto-submit functionality
 * @param timeLimit - Time limit in minutes (0 or null = no limit)
 * @param onExpire - Callback when timer expires
 */
export function useQuizTimer(timeLimit: number | null, onExpire: () => void) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    timeLimit ? timeLimit * 60 : null
  ); // Convert minutes to seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (!prev || prev <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining]);

  // Trigger onExpire when time reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpire();
    }
  }, [timeRemaining, onExpire]);

  const formatTime = useCallback((seconds: number | null): string => {
    if (seconds === null) return '';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const isWarning = timeRemaining !== null && timeRemaining > 0 && timeRemaining < 60;

  return {
    timeRemaining,
    formatTime,
    isWarning,
    formattedTime: formatTime(timeRemaining),
  };
}
