import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatBoard } from '../ChatBoard';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ContactType } from '@/types/common';
import { SessionManager } from 'sip.js/lib/platform/web';
import { SipStatus } from '@/types/siptypes';

// Define interfaces for typing
interface Message {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
}

interface SelectedContact {
  id: string;
  name: string;
  number: string;
  contactType: ContactType;
}

// Define action type interface
interface MessageAction {
  type: 'messages/send';
  payload: {
    to: string;
    message: string;
  };
}

// Define custom action type
type AppAction = MessageAction | { type: string; payload: any };

// Mock the SipContext
vi.mock('@/contexts/SipContext', () => ({
  useSip: () => ({
    sessionManager: {
      message: vi.fn().mockResolvedValue(undefined),
    } as unknown as SessionManager,
    connectAndRegister: vi.fn(),
    disconnect: vi.fn().mockResolvedValue(undefined),
    sipStatus: SipStatus.REGISTERED,
    sessions: {},
    phoneState: null,
    setPhoneState: vi.fn(),
    extensionNumber: '',
    sessionTimer: {},
    sipMessages: {},
    showNotification: vi.fn(),
  }),
}));

// Mock the sendMessage action
vi.mock('@/core/messages/request', () => ({
  sendMessage: vi.fn().mockImplementation((data) => ({
    type: 'messages/send',
    payload: data,
  })),
  getMessages: vi.fn(),
}));

// Mock Redux store
const createMockStore = (selectedContact: SelectedContact | null = null, messages: Message[] = []) => {
  return configureStore({
    reducer: {
      contactsdata: (state = { selectedContact, messages }, action: any) => {
        // Use type assertion to handle action.payload safely
        const typedAction = action as AppAction;
        if (typedAction.type === 'messages/send') {
          return {
            ...state,
            messages: [
              ...state.messages,
              {
                id: 'new-message-id',
                from: 'me',
                to: typedAction.payload.to,
                message: typedAction.payload.message,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return state;
      },
      userdata: (state = { userData: { domain: 'test.com' } }, action) => state,
    },
  });
};

describe('ChatBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no contact is selected', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <ChatBoard />
      </Provider>
    );

    expect(screen.getByText('No contact selected')).toBeInTheDocument();
  });

  it('should send a WebRTC message when send button is clicked', async () => {
    const selectedContact = {
      id: '123',
      name: 'Test Contact',
      number: '1001',
      contactType: ContactType.WEBRTC,
    };
    
    const store = createMockStore(selectedContact);
    const { sessionManager } = await import('@/contexts/SipContext').then(m => m.useSip());
    const { sendMessage } = await import('@/core/messages/request');

    render(
      <Provider store={store}>
        <ChatBoard />
      </Provider>
    );

    // Type a message
    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });

    // Click send button
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    // Verify sessionManager.message was called
    expect(sessionManager?.message).toHaveBeenCalledWith(
      'sip:1001@test.com',
      'Hello, world!'
    );

    // Verify sendMessage action was dispatched
    expect(sendMessage).toHaveBeenCalledWith({
      to: '123',
      message: 'Hello, world!',
    });

    // ISSUE: No loading indicator or success message is shown to the user
    // The only feedback is that the input is cleared
    expect(input).toHaveValue('');
  });

  it('should handle errors when sending a message fails', async () => {
    const selectedContact = {
      id: '123',
      name: 'Test Contact',
      number: '1001',
      contactType: ContactType.WEBRTC,
    };
    
    const store = createMockStore(selectedContact);
    
    // Mock sessionManager.message to throw an error
    const { useSip } = await import('@/contexts/SipContext');
    vi.mocked(useSip).mockReturnValue({
      sessionManager: {
        message: vi.fn().mockRejectedValue(new Error('Failed to send message')),
      } as unknown as SessionManager,
      connectAndRegister: vi.fn(),
      disconnect: vi.fn().mockResolvedValue(undefined),
      sipStatus: SipStatus.REGISTERED,
      sessions: {},
      phoneState: null,
      setPhoneState: vi.fn(),
      extensionNumber: '',
      sessionTimer: {},
      sipMessages: {},
      showNotification: vi.fn(),
    });

    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <ChatBoard />
      </Provider>
    );

    // Type a message
    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });

    // Click send button
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    // Wait for the promise to reject
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    // ISSUE: No error message is shown to the user
    // The error is only logged to the console
    expect(screen.queryByText(/failed to send/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should handle delayed message sending without feedback', async () => {
    const selectedContact = {
      id: '123',
      name: 'Test Contact',
      number: '1001',
      contactType: ContactType.WEBRTC,
    };
    
    const store = createMockStore(selectedContact);
    
    // Mock sessionManager.message to delay
    const { useSip } = await import('@/contexts/SipContext');
    vi.mocked(useSip).mockReturnValue({
      sessionManager: {
        message: vi.fn().mockImplementation(() => new Promise(resolve => {
          // Simulate a network delay
          setTimeout(() => resolve(undefined), 1000);
        })),
      } as unknown as SessionManager,
      connectAndRegister: vi.fn(),
      disconnect: vi.fn().mockResolvedValue(undefined),
      sipStatus: SipStatus.REGISTERED,
      sessions: {},
      phoneState: null,
      setPhoneState: vi.fn(),
      extensionNumber: '',
      sessionTimer: {},
      sipMessages: {},
      showNotification: vi.fn(),
    });

    render(
      <Provider store={store}>
        <ChatBoard />
      </Provider>
    );

    // Type a message
    const input = screen.getByPlaceholderText('Type your message here...');
    fireEvent.change(input, { target: { value: 'Hello, world!' } });

    // Click send button
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    // ISSUE: No loading indicator is shown during the delay
    // The input is cleared immediately, but the user doesn't know if the message is being sent
    expect(input).toHaveValue('');
    
    // No loading indicator or "sending..." message
    expect(screen.queryByText(/sending/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});