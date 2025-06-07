import { UserAgent, UserAgentOptions, Registerer, Session, SessionState, Inviter, Invitation, URI, SessionDescriptionHandler } from 'sip.js';
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
  };
  private callTimer: NodeJS.Timeout | null = null;
  private isInitializing: boolean = false;

  constructor() {
    // No initialization needed in constructor
  }

  private async requestAudioPermissions(): Promise<MediaStream | null> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      console.warn('MediaDevices API is not available in this environment');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      return stream;
    } catch (error) {
      console.warn('Failed to get audio permissions:', error);
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
            // audio: {
            //   echoCancellation: true,
            //   noiseSuppression: true,
            //   autoGainControl: true
            // },
            audio: true,
            video: false
          }
        }
      };

      // Create new UserAgent instance
      const userAgent = new UserAgent(options);
      
      // Set up event handlers before starting
      userAgent.delegate = {
        onInvite: async (invitation: Invitation) => {
          this.currentSession = invitation;
          await this.answerCall();
        },
      };

      console.log('Starting UserAgent...');
      await userAgent.start();
      console.log('UserAgent started successfully');

      // Only assign to class property after successful start
      this.userAgent = userAgent;
      
      // Create registerer after userAgent is started
      this.registerer = new Registerer(this.userAgent);
      
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
      // Check if we have any audio input devices
      const devices = await navigator.mediaDevices?.enumerateDevices() || [];
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      if (audioInputs.length === 0) {
        // throw new Error('No microphone found. Please connect a microphone and try again.');
      }

      // Try to get audio stream with specific device
      const audioStream = await this.requestAudioPermissions();
      if (!audioStream) {
        // throw new Error('Could not access microphone. Please check your browser permissions and try again.');
      }

      const target = new URI('sip', number, this.config.server);
      const inviter = new Inviter(this.userAgent, target);
      this.currentSession = inviter;
      
      inviter.stateChange.addListener((state: SessionState) => {
        switch (state) {
          case SessionState.Established:
            this.callState.isCallActive = true;
            this.callState.remoteNumber = number;
            this.startCallTimer();
            this.handleRemoteMedia(inviter);
            break;
          case SessionState.Terminated:
            this.endCall();
            break;
        }
      });

      await inviter.invite();

      // Clean up audio stream if we got one
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Failed to make call:', error);
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
      // Try to get audio stream, but continue even if it fails
      const audioStream = await this.requestAudioPermissions();
      if (!audioStream) {
        console.warn('Proceeding with call without audio permissions');
      }

      await this.currentSession.accept();
      this.callState.isCallActive = true;
      this.startCallTimer();
      this.handleRemoteMedia(this.currentSession);

      // Clean up audio stream if we got one
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Failed to answer call:', error);
      throw error;
    }
  }

  async hangup(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session to hangup');
    }

    try {
      if (this.currentSession instanceof Inviter) {
        await this.currentSession.bye();
      } else if (this.currentSession instanceof Invitation) {
        await this.currentSession.bye();
      }
      this.endCall();
    } catch (error) {
      console.error('Failed to hangup call:', error);
      throw error;
    }
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
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
    this.callState.isCallActive = false;
    this.callState.remoteNumber = undefined;
    this.callState.callDuration = 0;
    this.callState.callStartTime = undefined;
    this.callState.remoteStream = undefined;
    this.currentSession = null;
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