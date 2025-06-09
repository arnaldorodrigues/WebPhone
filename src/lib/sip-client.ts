import { UserAgent, UserAgentOptions, Registerer, Session, SessionState, Inviter, Invitation, URI, Web } from 'sip.js';
import type { SessionDescriptionHandler as WebSessionDescriptionHandler } from 'sip.js/lib/platform/web/session-description-handler';

export interface SipConfig {
  wsServer: string;
  wsPort: string;
  wsPath: string;
  server: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface CallState {
  isRegistered: boolean;
  isCallActive: boolean;
  remoteNumber?: string;
  callDuration: number;
  callStartTime?: Date;
  remoteStream?: MediaStream;
  incomingCall?: boolean;
  isMuted?: boolean;
  isOnHold?: boolean;
  localStream?: MediaStream;
}

// Add callback interface for UI updates
export interface SipCallbacks {
  onIncomingCall?: (remoteNumber: string, invitation: Invitation) => void;
  onCallStateChanged?: (state: CallState) => void;
  onRegistrationStateChanged?: (isRegistered: boolean) => void;
  onError?: (error: Error) => void;
}

class SipClient {
  private userAgent: UserAgent | null = null;
  private registerer: Registerer | null = null;
  private config: SipConfig | null = null;
  private currentSession: Session | null = null;
  private callState: CallState = {
    isRegistered: false,
    isCallActive: false,
    callDuration: 0,
    incomingCall: false,
    isMuted: false,
    isOnHold: false,
  };
  private callTimer: NodeJS.Timeout | null = null;
  private isInitializing: boolean = false;
  private callbacks: SipCallbacks = {};

  constructor() {
    // No initialization needed in constructor
  }

  // Add method to set callbacks
  setCallbacks(callbacks: SipCallbacks): void {
    this.callbacks = callbacks;
  }

  private async requestAudioPermissions(): Promise<MediaStream | null> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      console.warn('MediaDevices API is not available in this environment');
      return null;
    }

    try {
      console.log('Requesting microphone permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('Microphone permissions granted successfully');
      return stream;
    } catch (error) {
      console.warn('Microphone access failed (this is OK for outgoing calls):', error);
      // Don't throw error - just return null and continue
      return null;
    }
  }

  private handleRemoteMedia(session: Session): void {
    const remoteMedia = document.getElementById(
      "remoteAudio"
    ) as HTMLAudioElement;

    const pc = (session.sessionDescriptionHandler as WebSessionDescriptionHandler)?.peerConnection;
    if (!pc) return;

    const stream = new MediaStream();
    pc.getReceivers().forEach((receiver: RTCRtpReceiver) => {
      if (receiver.track) {
        stream.addTrack(receiver.track);
      }
    });

    // Update call state with the remote stream
    this.callState.remoteStream = stream;

    remoteMedia.srcObject = stream;
    remoteMedia.play();
  }

  async initialize(config: SipConfig): Promise<void> {
    if (this.isInitializing) {
      console.log('SIP client is already initializing...');
      return;
    }

    if (this.userAgent) {
      console.log('SIP client is already initialized, destroying previous instance...');
      await this.destroy();
    }

    this.isInitializing = true;
    this.config = { ...config }; // Create a copy of the config

    try {
      // Request audio permissions first
      // await this.requestAudioPermissions();

      const wsUrl = config.wsServer + ':' + config.wsPort + config.wsPath;
      console.log('Initializing SIP client with WebSocket URL:', wsUrl);

      const options: UserAgentOptions = {
        uri: new URI('sip', config.username, config.server),
        authorizationUsername: config.username,
        authorizationPassword: config.password,
        displayName: config.displayName,
        transportOptions: {
          server: wsUrl
        },
        sessionDescriptionHandlerFactoryOptions: {
          peerConnectionConfiguration: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          },
          iceGatheringTimeout: 5000,
          constraints: {
            // Make audio optional - calls can work without microphone
            audio: false, // Set to false to not require microphone
            video: false
          }
        }
      };

      // Create new UserAgent instance
      const userAgent = new UserAgent(options);
      
      // Set up event handlers before starting
      userAgent.delegate = {
        onInvite: (invitation: Invitation) => {
          console.log('INCOMING CALL DETECTED');
          console.log('From:', invitation.remoteIdentity?.uri?.toString());
          console.log('Remote number:', invitation.remoteIdentity?.uri?.user);
          
          this.currentSession = invitation;
          
          // Extract remote number from invitation
          const remoteNumber = invitation.remoteIdentity?.uri?.user || 'Unknown';
          
          // Update call state
          this.callState.incomingCall = true;
          this.callState.remoteNumber = remoteNumber;
          
          console.log('Call state updated:', this.callState);
          
          // Set up invitation event handlers
          invitation.stateChange.addListener((state: SessionState) => {
            console.log('Incoming call state changed:', state);
            switch (state) {
              case SessionState.Established:
                console.log('Incoming call established successfully');
                this.callState.isCallActive = true;
                this.callState.incomingCall = false;
                this.startCallTimer();
                this.handleRemoteMedia(invitation);
                this.callbacks.onCallStateChanged?.(this.callState);
                break;
              case SessionState.Terminating:
                console.log('Incoming call terminating (remote party ending call)...');
                break;
              case SessionState.Terminated:
                console.log('Incoming call terminated by remote party');
                this.endCall();
                break;
            }
          });

          console.log('Notifying UI about incoming call...');
          // Notify UI about incoming call - DON'T auto-answer
          this.callbacks.onIncomingCall?.(remoteNumber, invitation);
          this.callbacks.onCallStateChanged?.(this.callState);
        },
        onConnect: () => {
          console.log('SIP UserAgent connected');
        },
        onDisconnect: (error?: Error) => {
          console.log('SIP UserAgent disconnected', error);
          if (error) {
            this.callbacks.onError?.(error);
          }
        }
      };

      console.log('Starting UserAgent...');
      await userAgent.start();
      console.log('UserAgent started successfully');

      // Only assign to class property after successful start
      this.userAgent = userAgent;
      
      // Create registerer after userAgent is started
      this.registerer = new Registerer(this.userAgent);
      
      // Add registration state change handler
      this.registerer.stateChange.addListener((state) => {
        console.log('Registration state changed:', state);
        const isRegistered = state === 'Registered';
        this.callState.isRegistered = isRegistered;
        this.callbacks.onRegistrationStateChanged?.(isRegistered);
        this.callbacks.onCallStateChanged?.(this.callState);
      });
      
      console.log('Registering...');
      if (this.registerer) {
        await this.registerer.register();
        console.log('Registration successful');
        this.callState.isRegistered = true;
      } else {
        throw new Error('Failed to create registerer');
      }

      console.log('SIP client initialization complete:', {
        userAgent: !!this.userAgent,
        isRegistered: this.callState.isRegistered
      });

    } catch (error) {
      console.error('Failed to initialize SIP client:', error);
      // Clean up on error
      await this.destroy();
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async makeCall(number: string): Promise<void> {
    console.log('MAKING CALL to:', number);
    console.log('Making call with state:', {
      userAgent: !!this.userAgent,
      isRegistered: this.callState.isRegistered,
      config: !!this.config
    });

    if (!this.userAgent) {
      throw new Error('SIP client not initialized - UserAgent is null');
    }

    if (!this.callState.isRegistered) {
      throw new Error('SIP client not registered');
    }

    if (!this.config?.server) {
      throw new Error('SIP configuration is missing');
    }

    try {
      // Update call state to show we're making a call
      this.callState.remoteNumber = number;
      console.log('Updated call state for outgoing call:', this.callState);
      this.callbacks.onCallStateChanged?.(this.callState);

      console.log('Checking audio devices (optional for outgoing calls)...');
      
      // Check if we have any audio input devices (but don't require them)
      const devices = await navigator.mediaDevices?.enumerateDevices() || [];
      const audioInputs = devices.filter(device => device.kind === 'audioinput');

      console.log("Audio devices found:", devices.length, "Audio inputs:", audioInputs.length);
      
      if (audioInputs.length === 0) {
        console.warn('No microphone found, but proceeding with call anyway...');
      }

      // Try to get audio stream, but don't fail if we can't
      let audioStream: MediaStream | null = null;
      try {
        audioStream = await this.requestAudioPermissions();
        if (audioStream) {
          console.log('Microphone access granted');
        } else {
          console.warn('No microphone access, but continuing without it');
        }
      } catch (error) {
        console.warn('Failed to get microphone permissions, continuing without audio:', error);
      }

      console.log('Creating SIP INVITE (microphone not required)...');
      const target = new URI('sip', number, this.config.server);
      console.log('Creating SIP URI:', target.toString());
      
      const inviter = new Inviter(this.userAgent, target);
      this.currentSession = inviter;
      
      inviter.stateChange.addListener((state: SessionState) => {
        console.log('Outgoing call state changed:', state);
        switch (state) {
          case SessionState.Establishing:
            console.log('Call establishing...');
            break;
          case SessionState.Established:
            console.log('Outgoing call established successfully');
            this.callState.isCallActive = true;
            this.callState.remoteNumber = number;
            
            // Keep the audio stream for mute functionality
            if (audioStream) {
              this.callState.localStream = audioStream;
              console.log('Local audio stream stored for mute functionality');
            }
            
            this.startCallTimer();
            this.handleRemoteMedia(inviter);
            this.callbacks.onCallStateChanged?.(this.callState);
            break;
          case SessionState.Terminating:
            console.log('Outgoing call terminating (remote party ending call)...');
            break;
          case SessionState.Terminated:
            console.log('Outgoing call terminated by remote party');
            this.endCall();
            break;
        }
      });

      console.log('Sending INVITE...');
      await inviter.invite();
      console.log('INVITE sent successfully', inviter);

      // DON'T clean up audio stream here - keep it for the call
    } catch (error) {
      console.error('Failed to make call:', error);
      
      // Reset call state on error
      this.callState.remoteNumber = undefined;
      this.callbacks.onCallStateChanged?.(this.callState);
      
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotAllowedError') {
          throw new Error('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (error.name === 'NotReadableError') {
          throw new Error('Could not access microphone. It may be in use by another application.');
        }
      }
      throw error;
    }
  }

  async answerCall(): Promise<void> {
    if (!this.currentSession || !(this.currentSession instanceof Invitation)) {
      throw new Error('No active session to answer');
    }

    try {
      console.log('Answering incoming call...');
      
      // Try to get audio stream, but continue even if it fails
      let audioStream: MediaStream | null = null;
      try {
        audioStream = await this.requestAudioPermissions();
        if (!audioStream) {
          console.warn('Proceeding with call without microphone (listen-only mode)');
        }
      } catch (error) {
        console.warn('Failed to get microphone for incoming call, proceeding in listen-only mode:', error);
      }

      await this.currentSession.accept();
      console.log('Incoming call accepted successfully');
      
      this.callState.isCallActive = true;
      
      // Keep the audio stream for mute functionality
      if (audioStream) {
        this.callState.localStream = audioStream;
        console.log('Local audio stream stored for mute functionality');
      }
      
      this.startCallTimer();
      this.handleRemoteMedia(this.currentSession);

      // DON'T clean up audio stream here - keep it for the call
    } catch (error) {
      console.error('Failed to answer call:', error);
      throw error;
    }
  }

  async hangup(): Promise<void> {
    console.log('=== HANGUP FUNCTION CALLED ===');
    
    if (!this.currentSession) {
      console.log('ERROR: No active session to hangup');
      throw new Error('No active session to hangup');
    }

    console.log('Session details:', {
      state: this.currentSession.state,
      type: this.currentSession instanceof Inviter ? 'Inviter' : 'Invitation',
      hasSession: !!this.currentSession
    });
    
    const currentDuration = this.callState.callDuration;

    try {
      if (this.currentSession instanceof Inviter) {
        console.log('Processing outgoing call termination...');
        
        if (this.currentSession.state === SessionState.Initial || this.currentSession.state === SessionState.Establishing) {
          console.log('Attempting to cancel outgoing call (not yet established)...');
          console.log('Session state before cancel:', this.currentSession.state);
          
          try {
            await this.currentSession.cancel();
            console.log('✅ Call canceled successfully');
          } catch (cancelError) {
            console.error('❌ Cancel method failed:', cancelError);
            // Try alternative termination
            console.log('Trying alternative termination with bye()...');
            try {
              await this.currentSession.bye();
              console.log('✅ Alternative bye() worked');
            } catch (byeError) {
              console.error('❌ Alternative bye() also failed:', byeError);
              throw cancelError; // Throw original cancel error
            }
          }
        } else if (this.currentSession.state === SessionState.Established) {
          console.log('Hanging up established outgoing call...');
          await this.currentSession.bye();
          console.log('✅ Established call hung up successfully');
        } else {
          console.log('Call is in state:', this.currentSession.state, '- attempting forced termination');
          // For any other state, try to force termination
          try {
            await this.currentSession.bye();
            console.log('✅ Forced termination successful');
          } catch (forceError) {
            console.log('Forced termination failed, cleaning up manually:', forceError);
          }
        }
      } else if (this.currentSession instanceof Invitation) {
        console.log('Processing incoming call termination...');
        
        if (this.currentSession.state === SessionState.Established) {
          console.log('Hanging up established incoming call...');
          await this.currentSession.bye();
          console.log('✅ Established incoming call hung up successfully');
        } else {
          console.log('Declining incoming call...');
          await this.currentSession.reject();
          console.log('✅ Incoming call declined successfully');
        }
      }
      
      console.log('Call termination successful, cleaning up state...');
      // For user-initiated hangup, we want to preserve duration like remote termination
      this.endCallWithDuration(currentDuration);
      console.log('=== HANGUP COMPLETED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('=== HANGUP FAILED ===');
      console.error('Error details:', error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : error);
      
      // Even on error, clean up state and preserve duration for UI
      console.log('Cleaning up state despite error...');
      this.endCallWithDuration(currentDuration);
      
      // Don't throw the error - let the UI handle the state cleanup
      console.log('=== HANGUP ERROR HANDLED ===');
    }
  }

  // New method to end call while preserving duration for UI
  private endCallWithDuration(preservedDuration: number): void {
    console.log('Ending call (user initiated) - preserving duration for UI:', preservedDuration);
    
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
      console.log('Call timer stopped');
    }
    
    // Clean up local stream
    if (this.callState.localStream) {
      this.callState.localStream.getTracks().forEach(track => track.stop());
      console.log('Local media stream stopped');
    }
    
    this.callState.isCallActive = false;
    this.callState.incomingCall = false;
    this.callState.remoteNumber = undefined;
    this.callState.callStartTime = undefined;
    this.callState.remoteStream = undefined;
    this.callState.localStream = undefined;
    this.callState.isMuted = false;
    this.callState.isOnHold = false;
    this.currentSession = null;
    
    // For canceled calls (duration = 0), set a minimal duration to trigger UI transition
    if (preservedDuration === 0) {
      console.log('Call was canceled - setting minimal duration to trigger UI transition');
      this.callState.callDuration = 1; // Set to 1 second to trigger UI transition
    } else {
      this.callState.callDuration = preservedDuration;
    }
    
    console.log('Call state reset. Call duration set to:', this.callState.callDuration, 'seconds');
    
    // Notify UI of state change - this should trigger phoneState to 'ended'
    this.callbacks.onCallStateChanged?.(this.callState);
    console.log('UI notified of user-initiated call termination');
    
    // Reset call duration after a delay to allow UI to process the ended state
    setTimeout(() => {
      this.callState.callDuration = 0;
      this.callbacks.onCallStateChanged?.(this.callState);
      console.log('Call duration reset after UI processing');
    }, 100);
  }

  async decline(): Promise<void> {
    if (!this.currentSession || !(this.currentSession instanceof Invitation)) {
      throw new Error('No active session to answer');
    }

    try{
      this.currentSession.reject();
    } catch(error) {
      console.error("Filed to decline call", error);
      throw error;
    }
  }

  // New method to enable microphone during an active call
  async enableMicrophone(): Promise<boolean> {
    if (!this.callState.isCallActive || !this.currentSession) {
      console.warn('No active call to enable microphone for');
      return false;
    }

    try {
      console.log('Enabling microphone for active call...');
      const audioStream = await this.requestAudioPermissions();
      
      if (audioStream) {
        console.log('Microphone enabled successfully');
        this.callState.localStream = audioStream;
        this.callbacks.onCallStateChanged?.(this.callState);
        return true;
      } else {
        console.warn('Failed to enable microphone');
        return false;
      }
    } catch (error) {
      console.error('Error enabling microphone:', error);
      return false;
    }
  }

  // Mute/Unmute functionality
  async toggleMute(): Promise<boolean> {
    if (!this.callState.isCallActive || !this.currentSession) {
      console.warn('No active call to mute/unmute');
      return false;
    }

    try {
      const newMuteState = !this.callState.isMuted;
      
      if (this.callState.localStream) {
        // Mute/unmute all audio tracks
        this.callState.localStream.getAudioTracks().forEach(track => {
          track.enabled = !newMuteState;
        });
      }
      // this.currentSession.muted = newMuteState;

      this.callState.isMuted = newMuteState;
      console.log(newMuteState ? 'Call muted' : 'Call unmuted');
      this.callbacks.onCallStateChanged?.(this.callState);
      return true;
    } catch (error) {
      console.error('Error toggling mute:', error);
      return false;
    }
  }

  // Hold/Resume functionality
  async toggleHold(): Promise<boolean> {
    if (!this.callState.isCallActive || !this.currentSession) {
      console.warn('No active call to hold/resume');
      return false;
    }

    try {
      const newHoldState = !this.callState.isOnHold;
      // if (newHoldState) {
      //   // Put call on hold
      //   console.log('Putting call on hold...');
      //   // const sessionDescriptionHandler = this.currentSession?.sessionDescriptionHandler as any;
      //   // sessionDescriptionHandler.hold();
      //   await (this.currentSession as any).hold({ modifiers: [Web.holdModifier] });
      //   console.log('Call put on hold successfully');
      // } else {
      //   // Resume call from hold
      //   console.log('Resuming call from hold...');
      //   // const sessionDescriptionHandler = this.currentSession?.sessionDescriptionHandler as any;
      //   // sessionDescriptionHandler.unhold();
      //   await (this.currentSession as any).unhold();
      //   console.log('Call resumed from hold successfully');
      // }
      if (this.currentSession) {
        const options = {
          sessionDescriptionHandlerModifiers: newHoldState ? [Web.holdModifier] : [],
        };
        this.currentSession.invite(options)
          .then(() => {
            // Handle success
            console.log("Call put on hold successfully", newHoldState);
            this.callState.isOnHold = newHoldState;
            this.callbacks.onCallStateChanged?.(this.callState);
            console.log("123123123213 ", this.currentSession?.sessionDescriptionHandler?.getDescription())
          })
          .catch((error) => {
            // Handle error
            console.error("Error putting call on hold:", error);
          });
      }

      this.callState.isOnHold = newHoldState;
      this.callbacks.onCallStateChanged?.(this.callState);
      return true;
    } catch (error) {
      console.error('Error toggling hold:', error);
      // Fallback: manually manage hold state for basic functionality
      this.callState.isOnHold = !this.callState.isOnHold;
      console.log(this.callState.isOnHold ? 'Call marked as on hold (manual)' : 'Call marked as resumed (manual)');
      this.callbacks.onCallStateChanged?.(this.callState);
      return true;
    }
  }

  private startCallTimer(): void {
    this.callState.callStartTime = new Date();
    this.callTimer = setInterval(() => {
      if (this.callState.callStartTime) {
        const now = new Date();
        this.callState.callDuration = Math.floor(
          (now.getTime() - this.callState.callStartTime.getTime()) / 1000
        );
      }
    }, 1000);
  }

  private endCall(): void {
    console.log('Ending call (remote termination) - cleaning up call state and notifying UI');
    console.log('Call duration before cleanup:', this.callState.callDuration);
    
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
      console.log('Call timer stopped');
    }
    
    // Clean up local stream
    if (this.callState.localStream) {
      this.callState.localStream.getTracks().forEach(track => track.stop());
      console.log('Local media stream stopped');
    }
    
    // Store duration for UI display - DON'T reset it immediately
    const finalDuration = this.callState.callDuration;
    
    this.callState.isCallActive = false;
    this.callState.incomingCall = false;
    this.callState.remoteNumber = undefined;
    this.callState.callStartTime = undefined;
    this.callState.remoteStream = undefined;
    this.callState.localStream = undefined;
    // Keep callDuration for UI to detect call termination
    this.callState.isMuted = false;
    this.callState.isOnHold = false;
    this.currentSession = null;
    
    console.log('Call state reset. Final call duration:', finalDuration, 'seconds');
    
    // Notify UI of state change - this should trigger phoneState to 'ended'
    this.callbacks.onCallStateChanged?.(this.callState);
    console.log('UI notified of remote call termination');
    
    // Reset call duration after a delay to allow UI to process the ended state
    setTimeout(() => {
      this.callState.callDuration = 0;
      this.callbacks.onCallStateChanged?.(this.callState);
      console.log('Call duration reset after UI processing');
    }, 100);
  }

  getCallState(): CallState {
    return { ...this.callState };
  }

  async destroy(): Promise<void> {
    console.log('Destroying SIP client...', this.userAgent);
    
    if (this.registerer) {
      try {
        await this.registerer.unregister();
      } catch (error) {
        console.error('Error unregistering:', error);
      }
      this.registerer = null;
    }

    if (this.userAgent) {
      try {
        await this.userAgent.stop();
      } catch (error) {
        console.error('Error stopping UserAgent:', error);
      }
      this.userAgent = null;
    }

    this.callState.isRegistered = false;
    this.endCall();
    this.config = null;
    
    console.log('SIP client destroyed', this.userAgent);
  }
}

// Create a singleton instance
export const sipClient = new SipClient(); 