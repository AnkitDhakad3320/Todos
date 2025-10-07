import { useState, useEffect, useCallback, useRef } from 'react';

const useIdleTimer = ({
  timeout = 10 * 60 * 1000, // 10 minutes in milliseconds
  warningTime = 60 * 1000, // 60 seconds warning
  onTimeout,
  onWarning,
  onStayLoggedIn,
  onActivity
}) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isWarning, setIsWarning] = useState(false);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownRef = useRef(null);

  // Reset the timer on user activity
  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Reset states
    setTimeLeft(null);
    setIsWarning(false);

    // Notify activity
    onActivity?.();

    // Set new warning timer
    warningRef.current = setTimeout(() => {
      setIsWarning(true);
      setTimeLeft(warningTime / 1000); // Convert to seconds
      onWarning?.(warningTime / 1000);

      // Start countdown for final logout
      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            onTimeout?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeout - warningTime);

    // Set main timeout
    timeoutRef.current = setTimeout(() => {
      clearInterval(countdownRef.current);
      onTimeout?.();
    }, timeout);
  }, [timeout, warningTime, onTimeout, onWarning, onActivity]);

  // Handle stay logged in
  const handleStayLoggedIn = useCallback(() => {
    resetTimer();
    onStayLoggedIn?.();
  }, [resetTimer, onStayLoggedIn]);

  // Handle immediate logout
  const handleImmediateLogout = useCallback(() => {
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    // Reset states
    setTimeLeft(null);
    setIsWarning(false);
    
    // Trigger logout
    onTimeout?.();
  }, [onTimeout]);

  // Set up event listeners for user activity
  useEffect(() => {
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click',
      'keydown', 'wheel', 'resize', 'focus'
    ];

    const handleActivity = () => {
      if (isWarning) {
        // If user is active during warning period, reset timer
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer, isWarning]);

  return {
    timeLeft,
    isWarning,
    resetTimer,
    handleStayLoggedIn,
    handleImmediateLogout
  };
};

export default useIdleTimer;