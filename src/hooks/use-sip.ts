import { useState, useEffect, useCallback, useRef } from 'react';
import { sipClient, SipConfig, CallState } from '@/lib/sip-client';

export function useSip(config?: SipConfig) {
  const [callState, setCallState] = useState<CallState>(sipClient.getCallState());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const configRef = useRef(config);

  // Update configRef when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Handle initialization
  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      if (!configRef.current || isInitialized) return;

      try {
        await sipClient.initialize(configRef.current);
        if (isActive) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err : new Error('Failed to initialize SIP client'));
        }
      }
    };

    initialize();

    return () => {
      isActive = false;
    };
  }, [isInitialized, config]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        sipClient.destroy();
      }
    };
  }, [isInitialized]);

  const makeCall = useCallback(async (number: string) => {
    try {
      await sipClient.makeCall(number);
      setCallState(sipClient.getCallState());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to make call'));
    }
  }, []);

  const hangup = useCallback(async () => {
    try {
      await sipClient.hangup();
      setCallState(sipClient.getCallState());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to hangup call'));
    }
  }, []);

  // Update call state periodically
  useEffect(() => {
    if (callState.isCallActive) {
      const timer = setInterval(() => {
        setCallState(sipClient.getCallState());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [callState.isCallActive]);

  return {
    callState,
    isInitialized,
    error,
    makeCall,
    hangup,
  };
} 