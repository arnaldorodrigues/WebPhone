import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SipProvider } from '@/contexts/SipContext';
import { ChatBoard } from '@/components/phone/chat/ChatBoard';
import AddContactDialog from '@/components/phone/contacts/AddContactDialog';
import { ContactType } from '@/types/common';
import { SipStatus } from '@/types/siptypes';
import { SessionManager } from 'sip.js/lib/platform/web';

interface Message {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
}

// Define interfaces for our Redux state
interface ContactsState {
  selectedContact: {
    id: string;
    name: string;
    number: string;
    contactType: ContactType;
  } | null;
  messages: Message[];
  candidates: any[];
}

interface UserState {
  userData: {
    domain: string;
    name: string;
    sipUsername: string;
    sipPassword: string;
    wsServer: string;
    wsPort: string;
    wsPath: string;
  } | null;
  loading: boolean;
  loaded: boolean;
}

interface MessageAction {
  type: 'messages/send';
  payload: {
    to?: string;
    message?: string;
    id?: string;
  };
}

interface ContactAction {
  type: 'contacts/create';
  payload: {
    contactUserId?: string;
    contactType?: any;
    phoneNumber?: string;
  };
}

// Define our custom action type (renamed to avoid conflict with Redux's Action)
type AppAction = MessageAction | ContactAction | { type: string; payload: any };

// Mock the API client
vi.mock('@/lib/apiClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

// Mock the SipContext
vi.mock('@/contexts/SipContext', () => {
  const originalModule = vi.importActual('@/contexts/SipContext');
  
  const mockSessionManager: Partial<SessionManager> = {
    message: vi.fn().mockResolvedValue(undefined),
  };

  return {
    ...originalModule,
    useSip: () => ({
      sessionManager: mockSessionManager as SessionManager,
      sipStatus: SipStatus.REGISTERED,
      showNotification: vi.fn(),
    }),
  };
});

// Mock Redux actions
vi.mock('@/core/contacts/request', () => ({
  createContact: vi.fn().mockImplementation((data) => ({
    type: 'contacts/create',
    payload: data,
  })),
}));

vi.mock('@/core/messages/request', () => ({
  sendMessage: vi.fn().mockImplementation((data) => ({
    type: 'messages/send',
    payload: data,
  })),
  getMessages: vi.fn(),
}));

describe('Async Edge Cases', () => {
  let mockStore: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a mock store with default state
    mockStore = configureStore({
      reducer: {
        contactsdata: (state: ContactsState = {
          selectedContact: {
            id: '123',
            name: 'Test Contact',
            number: '1001',
            contactType: ContactType.WEBRTC,
          },
          messages: [] as Message[],
          candidates: [],
        }, action: any): ContactsState => {
          // Use type assertion to treat the action as our AppAction type
          const typedAction = action as AppAction;
          if (typedAction.type === 'messages/send') {
            return {
              ...state,
              messages: [
                ...state.messages,
                {
                  id: 'new-message-id',
                  from: 'me',
                  to: typedAction.payload.to || '',
                  message: typedAction.payload.message || '',
                  timestamp: new Date().toISOString(),
                } as Message,
              ],
            };
          }
          return state;
        },
        userdata: (state: UserState = {
          userData: {
            domain: 'test.com',
            name: 'Test User',
            sipUsername: 'test',
            sipPassword: 'password',
            wsServer: 'wss://test.com',
            wsPort: '8089',
            wsPath: '/ws',
          },
          loading: false,
          loaded: true,
        }): UserState => state,
      },
    });
  });
  
  describe('Backend Delays', () => {
    it('should handle delayed message sending without UI feedback', async () => {
      // Mock the sessionManager.message to delay
      const { useSip } = await import('@/contexts/SipContext');
      const mockSessionManager: Partial<SessionManager> = {
        message: vi.fn().mockImplementation(() => new Promise(resolve => {
          // Simulate a network delay of 2 seconds
          setTimeout(() => resolve(undefined), 2000);
        })),
      };
      vi.mocked(useSip).mockReturnValue({
        ...vi.mocked(useSip)(),
        sessionManager: mockSessionManager as SessionManager,
      });
      
      // Mock the sendMessage action to delay
      const { sendMessage } = await import('@/core/messages/request');
      vi.mocked(sendMessage).mockImplementation((): any => {
        // Return an object that matches the AsyncThunkAction interface
        // but also has a Promise-like structure for chaining
        const actionCreator = {
          type: 'messages/send',
          payload: { to: '123', message: 'Hello, world!' },
          // Add a then method to make it Promise-like
          then: (callback: Function) => {
            return new Promise(resolve => {
              // Simulate a network delay of 2 seconds
              setTimeout(() => {
                const result = callback({
                  type: 'messages/send',
                  payload: { to: '123', message: 'Hello, world!' },
                });
                resolve(result);
              }, 2000);
            });
          }
        };
        return actionCreator;
      });
      
      render(
        <Provider store={mockStore}>
          <SipProvider>
            <ChatBoard />
          </SipProvider>
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
      
      // Wait for the message to be sent
      await new Promise(resolve => setTimeout(resolve, 2100));
      
      // ISSUE: No success message is shown after the message is sent
      expect(screen.queryByText(/sent/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/success/i)).not.toBeInTheDocument();
    });
    
    it('should handle delayed contact creation without UI feedback', async () => {
      // Mock the createContact action to delay
      const { createContact } = await import('@/core/contacts/request');
      vi.mocked(createContact).mockImplementation((): any => {
        // Return an object that matches the AsyncThunkAction interface
        // but also has a Promise-like structure for chaining
        const actionCreator = {
          type: 'contacts/create',
          payload: { contactUserId: '', contactType: ContactType.SMS, phoneNumber: '1001' },
          // Add a then method to make it Promise-like
          then: (callback: Function) => {
            return new Promise(resolve => {
              // Simulate a network delay of 2 seconds
              setTimeout(() => {
                const result = callback({
                  type: 'contacts/create',
                  payload: { contactUserId: '', contactType: ContactType.SMS, phoneNumber: '1001' },
                });
                resolve(result);
              }, 2000);
            });
          }
        };
        return actionCreator;
      });
      
      const onClose = vi.fn();
      
      render(
        <Provider store={mockStore}>
          <AddContactDialog isOpen={true} onClose={onClose} />
        </Provider>
      );
      
      // Type a phone number
      const searchInput = screen.getByPlaceholderText('Search by name or number...');
      fireEvent.change(searchInput, { target: { value: '1001' } });
      
      // Click the Add Contact button
      const addButton = screen.getByText('Add Contact').closest('button')!;
      fireEvent.click(addButton);
      
      // ISSUE: The dialog closes immediately, without waiting for the contact to be created
      // No loading indicator is shown during the delay
      expect(onClose).toHaveBeenCalled();
      expect(screen.queryByText(/adding/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      
      // Wait for the contact to be created
      await new Promise(resolve => setTimeout(resolve, 2100));
      
      // ISSUE: No success message is shown after the contact is created
      // The dialog is already closed, so the user doesn't know if the contact was created
    });
  });
  
  describe('UI State Mismatches', () => {
    it('should handle button enabled before data is ready', async () => {
      // Mock the userdata state to be loading
      mockStore = configureStore({
        reducer: {
          contactsdata: (state: ContactsState = {
            selectedContact: null,
            messages: [] as Message[],
            candidates: [],
          }): ContactsState => state,
          userdata: (state: UserState = {
            userData: null,
            loading: true,
            loaded: false,
          }): UserState => state,
        },
      });
      
      const onClose = vi.fn();
      
      render(
        <Provider store={mockStore}>
          <AddContactDialog isOpen={true} onClose={onClose} />
        </Provider>
      );
      
      // Type a phone number
      const searchInput = screen.getByPlaceholderText('Search by name or number...');
      fireEvent.change(searchInput, { target: { value: '1001' } });
      
      // The Add Contact button should be enabled because the search query is not empty
      const addButton = screen.getByText('Add Contact').closest('button')!;
      expect(addButton).not.toBeDisabled();
      
      // ISSUE: The button is enabled even though the userdata is still loading
      // This could lead to unexpected behavior if the user clicks the button before the data is ready
      
      // Click the Add Contact button
      fireEvent.click(addButton);
      
      // The createContact action should be called, but it might fail because userData is null
      const { createContact } = await import('@/core/contacts/request');
      expect(createContact).toHaveBeenCalled();
    });
    
    it('should handle out-of-order API responses', async () => {
      // Mock the apiPost function to simulate out-of-order responses
      const { apiPost } = await import('@/lib/apiClient');
      
      // First call will resolve after 2 seconds
      vi.mocked(apiPost).mockImplementationOnce(() => {
        return new Promise<{success: boolean; data: {id: string; message: string}}>(resolve => {
          setTimeout(() => resolve({ success: true, data: { id: '1', message: 'First message' } }), 2000);
        });
      });

      // Second call will resolve after 1 second
      vi.mocked(apiPost).mockImplementationOnce(() => {
        return new Promise<{success: boolean; data: {id: string; message: string}}>(resolve => {
          setTimeout(() => resolve({ success: true, data: { id: '2', message: 'Second message' } }), 1000);
        });
      });
      
      // Mock the sendMessage action to use apiPost
      const { sendMessage } = await import('@/core/messages/request');
      vi.mocked(sendMessage).mockImplementation((data: any): any => {
        // Return an object that matches the AsyncThunkAction interface
        // but also has a Promise-like structure for chaining
        const actionCreator = {
          type: 'messages/send',
          payload: data,
          // Add a then method to make it Promise-like
          then: (callback: Function) => {
            return apiPost('/messages', data).then(response => {
              const action = {
                type: 'messages/send',
                payload: { ...data, id: response.data.id },
              };
              return callback(action);
            });
          }
        };
        return actionCreator;
      });
      
      render(
        <Provider store={mockStore}>
          <SipProvider>
            <ChatBoard />
          </SipProvider>
        </Provider>
      );
      
      // Type and send first message
      const input = screen.getByPlaceholderText('Type your message here...');
      fireEvent.change(input, { target: { value: 'First message' } });
      const sendButton = screen.getByRole('button');
      fireEvent.click(sendButton);
      
      // Type and send second message
      fireEvent.change(input, { target: { value: 'Second message' } });
      fireEvent.click(sendButton);
      
      // Wait for both messages to be sent
      await new Promise(resolve => setTimeout(resolve, 2100));
      
      // ISSUE: The second message will be displayed before the first message
      // This could lead to a confusing conversation flow for the user
      
      // Check that both sendMessage calls were made
      expect(sendMessage).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Smoke Test', () => {
    it('should handle a complete user flow: add contact → send message → start call → hang up', async () => {
      // This test would ideally use Playwright for E2E testing
      // For now, we'll just verify that the individual components work as expected
      
      // Mock the necessary functions
      const { createContact } = await import('@/core/contacts/request');
      const { sendMessage } = await import('@/core/messages/request');
      const { useSip } = await import('@/contexts/SipContext');
      
      // Mock the SIP functions
      const mockSessionManager: Partial<SessionManager> = {
        message: vi.fn().mockResolvedValue(undefined),
        call: vi.fn().mockResolvedValue({ id: 'call-123' }),
        hangup: vi.fn().mockResolvedValue(undefined),
      };
      
      vi.mocked(useSip).mockReturnValue({
        ...vi.mocked(useSip)(),
        sessionManager: mockSessionManager as SessionManager,
        setPhoneState: vi.fn(),
      });
      
      // 1. Add Contact
      const onClose = vi.fn();
      
      const { unmount } = render(
        <Provider store={mockStore}>
          <AddContactDialog isOpen={true} onClose={onClose} />
        </Provider>
      );
      
      // Type a phone number
      const searchInput = screen.getByPlaceholderText('Search by name or number...');
      fireEvent.change(searchInput, { target: { value: '1001' } });
      
      // Click the Add Contact button
      const addButton = screen.getByText('Add Contact').closest('button')!;
      fireEvent.click(addButton);
      
      // Verify that createContact was called
      expect(createContact).toHaveBeenCalled();
      
      // Clean up
      unmount();
      
      // 2. Send Message
      render(
        <Provider store={mockStore}>
          <SipProvider>
            <ChatBoard />
          </SipProvider>
        </Provider>
      );
      
      // Type a message
      const messageInput = screen.getByPlaceholderText('Type your message here...');
      fireEvent.change(messageInput, { target: { value: 'Hello, world!' } });
      
      // Click send button
      const sendButton = screen.getByRole('button');
      fireEvent.click(sendButton);
      
      // Verify that sendMessage was called
      expect(sendMessage).toHaveBeenCalled();
      
      // Verify that sessionManager.message was called
      expect(mockSessionManager.message).toHaveBeenCalled();
      
      // ISSUE: The smoke test is incomplete because we can't easily test the full flow
      // We would need to use Playwright for a proper E2E test
    });
  });
});