import { useState, useEffect, useCallback, useRef } from 'react';
import { sipClient, SipConfig, CallState, SipCallbacks } from '@/lib/sip-client';
import { Invitation } from 'sip.js';

export function useSip(config?: SipConfig) {
  const [callState, setCallState] = useState<CallState>(sipClient.getCallState());
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [incomingInvitation, setIncomingInvitation] = useState<Invitation | null>(null);
  const configRef = useRef(config);

  // Update configRef when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Set up SIP callbacks
  useEffect(() => {
    const callbacks: SipCallbacks = {
      onIncomingCall: (remoteNumber: string, invitation: Invitation) => {
        console.log('Incoming call from:', remoteNumber);
        setIncomingInvitation(invitation);
      },
      onCallStateChanged: (state: CallState) => {
        setCallState(state);
      },
      onRegistrationStateChanged: (isRegistered: boolean) => {
        console.log('Registration state changed:', isRegistered);
      },
      onError: (error: Error) => {
        setError(error);
      }
    };

    sipClient.setCallbacks(callbacks);
  }, []);

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
    console.log('🎯 Hook: makeCall called with number:', number);
    try {
      console.log('🎯 Hook: Calling sipClient.makeCall...');
      await sipClient.makeCall(number);
      console.log('🎯 Hook: sipClient.makeCall completed');
      setCallState(sipClient.getCallState());
      setError(null);
    } catch (err) {
      console.error('🎯 Hook: makeCall failed:', err);
      setError(err instanceof Error ? err : new Error('Failed to make call'));
      // Also update call state in case of error
      setCallState(sipClient.getCallState());
    }
  }, []);

  const answerCall = useCallback(async () => {
    try {
      await sipClient.answerCall();
      setIncomingInvitation(null);
      setCallState(sipClient.getCallState());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to answer call'));
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

  const decline = useCallback(async () => {
    try {
      await sipClient.decline();
      setIncomingInvitation(null);
      setCallState(sipClient.getCallState());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to decline call'));
    }
  }, []);

  const toggleMute = useCallback(async () => {
    try {
      console.log('🎯 Hook: Toggling mute...');
      await sipClient.toggleMute();
      setCallState(sipClient.getCallState());
      setError(null);
    } catch (err) {
      console.error('🎯 Hook: Failed to toggle mute:', err);
      setError(err instanceof Error ? err : new Error('Failed to toggle mute'));
    }
  }, []);

  const toggleHold = useCallback(async () => {
    try {
      console.log('🎯 Hook: Toggling hold...');
      await sipClient.toggleHold();
      setCallState(sipClient.getCallState());
      setError(null);
    } catch (err) {
      console.error('🎯 Hook: Failed to toggle hold:', err);
      setError(err instanceof Error ? err : new Error('Failed to toggle hold'));
    }
  }, []);

  const enableMicrophone = useCallback(async () => {
    try {
      console.log('🎯 Hook: Enabling microphone...');
      const success = await sipClient.enableMicrophone();
      setCallState(sipClient.getCallState());
      if (success) {
        setError(null);
      } else {
        setError(new Error('Failed to enable microphone'));
      }
      return success;
    } catch (err) {
      console.error('🎯 Hook: Failed to enable microphone:', err);
      setError(err instanceof Error ? err : new Error('Failed to enable microphone'));
      return false;
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
    incomingInvitation,
    makeCall,
    answerCall,
    hangup,
    decline,
    toggleMute,
    toggleHold,
    enableMicrophone
  };
} 