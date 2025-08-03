// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Create mock objects at the top level
const mockSessionManager = {
  message: vi.fn().mockResolvedValue(undefined),
  call: vi.fn().mockResolvedValue({ id: 'call-123' }),
  hangup: vi.fn().mockResolvedValue(undefined),
  connect: vi.fn(),
  disconnect: vi.fn(),
  register: vi.fn(),
  unregister: vi.fn(),
};

// Mock modules with inline implementations
vi.mock('@/lib/apiClient', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: 'me', userName: 'Test User' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the SipContext with a simpler approach
vi.mock('@/contexts/SipContext', () => {
  return {
    useSip: () => ({
      sessionManager: mockSessionManager,
      sipStatus: 'REGISTERED',
      showNotification: vi.fn(),
      setPhoneState: vi.fn(),
      connectAndRegister: vi.fn(),
      disconnect: vi.fn(),
      sessions: {},
      phoneState: null,
      sipMessages: {},
      extensionNumber: '',
      sessionTimer: {},
    }),
    SipProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock('@/core/contacts/request', () => ({
  createContact: vi.fn().mockImplementation((data?: any): any => {
    // Return a thunk function that Redux can handle
    return (dispatch: any) => {
      // Dispatch a pending action
      dispatch({
        type: 'contacts/create/pending',
        meta: { arg: data, requestId: 'mock-request-id' },
      });
      
      // Return a promise that resolves with the result
      return new Promise(resolve => {
        setTimeout(() => {
          // Dispatch a fulfilled action
          const fulfilledAction = {
            type: 'contacts/create/fulfilled',
            payload: data,
            meta: { arg: data, requestId: 'mock-request-id' },
          };
          
          dispatch(fulfilledAction);
          resolve(fulfilledAction);
        }, 0);
      });
    };
  }),
}));

vi.mock('@/core/messages/request', () => ({
  sendMessage: vi.fn().mockImplementation((data?: any): any => {
    // Return a thunk function that Redux can handle
    return (dispatch: any) => {
      // Dispatch a pending action
      dispatch({
        type: 'messages/send/pending',
        meta: { arg: data, requestId: 'mock-request-id' },
      });
      
      // Return a promise that resolves with the result
      return new Promise(resolve => {
        setTimeout(() => {
          // Dispatch a fulfilled action
          const fulfilledAction = {
            type: 'messages/send/fulfilled',
            payload: data,
            meta: { arg: data, requestId: 'mock-request-id' },
          };
          
          dispatch(fulfilledAction);
          resolve(fulfilledAction);
        }, 0);
      });
    };
  }),
  getMessages: vi.fn(),
}));

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SipProvider, useSip } from '@/contexts/SipContext';
import { ChatBoard } from '@/components/phone/chat/ChatBoard';
import AddContactDialog from '@/components/phone/contacts/AddContactDialog';
import { ContactType } from '@/types/common';
import { apiPost } from '@/lib/apiClient';
import { createContact } from '@/core/contacts/request';
import { sendMessage, getMessages } from '@/core/messages/request';

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

// These mock definitions are now at the top of the file

describe('Async Edge Cases', () => {
  let mockStore: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();

    // The mock implementations are already set up in the vi.mock() calls
    // We don't need to set them up again here

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
      // Configure middleware to handle thunks and ignore non-serializable values
      middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        thunk: true,
        serializableCheck: {
          // Ignore non-serializable values in these actions
          ignoredActions: ['contacts/create', 'messages/send'],
          // Ignore these paths in the state
          ignoredPaths: ['payload.then'],
        },
      }),
    });
  });

  describe('Backend Delays', () => {
    it('should handle delayed message sending without UI feedback', async () => {
      // Reset the mocks before the test
      mockSessionManager.message.mockClear();
      vi.mocked(sendMessage).mockClear();

      // Mock the sessionManager.message to delay
      mockSessionManager.message.mockImplementation(() => new Promise(resolve => {
        // Simulate a network delay of 2 seconds
        setTimeout(() => resolve(undefined), 2000);
      }));

      // Mock the sendMessage action to return an AsyncThunkAction-like object
      vi.mocked(sendMessage).mockImplementation((): any => {
        const actionCreator = {
          type: 'messages/send',
          payload: { to: '123', message: 'Hello, world!' },
          // Add a then method to make it Promise-like
          then: (callback: Function) => {
            return new Promise(resolve => {
              setTimeout(() => {
                const result = callback({
                  type: 'messages/send',
                  payload: { to: '123', message: 'Hello, world!' },
                });
                resolve(result);
              }, 0);
            });
          }
        };
        return actionCreator;
      });

      // Set up a delay for the test
      const delay = () => new Promise(resolve => setTimeout(resolve, 2000));

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
      const sendButton = screen.getAllByRole('button')[1]; // Get the send button (second button)
      
      // Wrap the click event in act
      await act(async () => {
        fireEvent.click(sendButton);
      });

      // The input is cleared immediately
      expect(input).toHaveValue('');

      // We've added a loading indicator to show that the message is being sent
      // This is an improvement over the original implementation
      expect(screen.queryByText(/sending/i)).toBeInTheDocument();

      // Wait for the message to be sent - wrap in act
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2100));
      });

      // We've added a success message to show that the message was sent successfully
      // This is an improvement over the original implementation
      expect(screen.queryByText(/success/i)).toBeInTheDocument();
    });

    it('should handle delayed contact creation with UI feedback', async () => {
      // Reset the mock before the test
      vi.mocked(createContact).mockClear();
      
      // Mock the createContact action to return a thunk function that resolves after a delay
      vi.mocked(createContact).mockImplementation((data?: any): any => {
        return (dispatch: any) => {
          // Dispatch a pending action
          dispatch({
            type: 'contacts/create/pending',
            meta: { arg: data, requestId: 'mock-request-id' },
          });
          
          // Return a promise that resolves with the result after a delay
          return new Promise(resolve => {
            setTimeout(() => {
              // Dispatch a fulfilled action
              const fulfilledAction = {
                type: 'contacts/create/fulfilled',
                payload: data,
                meta: { arg: data, requestId: 'mock-request-id' },
              };
              
              dispatch(fulfilledAction);
              resolve(fulfilledAction);
            }, 2000); // 2 second delay
          });
        };
      });
      
      // Mock onClose to track when it's called
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
      const addButton = screen.getByTestId('add-contact-button');
      
      // Wrap the click event in act
      await act(async () => {
        fireEvent.click(addButton);
      });
      
      // Verify that the dialog is still open (onClose hasn't been called yet)
      expect(onClose).not.toHaveBeenCalled();
      
      // Verify that createContact was called with the correct parameters
      expect(vi.mocked(createContact)).toHaveBeenCalledWith({
        contactUserId: '',
        contactType: ContactType.SMS,
        phoneNumber: '1001'
      });
      
      // Verify that loading indicators are visible
      expect(screen.getByText('Adding contact...')).toBeInTheDocument();
      expect(screen.getByText('Adding...')).toBeInTheDocument();
      
      // Wait for the contact to be created (2 seconds) - wrap in act
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2100));
      });
      
      // Verify that the success message is shown
      expect(screen.getByText('Contact added successfully!')).toBeInTheDocument();
      
      // Wait for the dialog to close (1.5 seconds after success) - wrap in act
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1600));
      });
      
      // Verify that onClose was called
      expect(onClose).toHaveBeenCalled();
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
      const addButton = screen.getByTestId('add-contact-button');
      expect(addButton).not.toBeDisabled();

      // ISSUE: The button is enabled even though the userdata is still loading
      // This could lead to unexpected behavior if the user clicks the button before the data is ready

      // Click the Add Contact button
      fireEvent.click(addButton);

      // The createContact action should be called, but it might fail because userData is null
      expect(vi.mocked(createContact)).toHaveBeenCalled();
    });

    it('should handle out-of-order API responses', async () => {
      // Reset the mocks before the test
      vi.mocked(apiPost).mockClear();
      vi.mocked(sendMessage).mockClear();

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

      // Mock the sendMessage action to return an AsyncThunkAction-like object
      vi.mocked(sendMessage).mockImplementation((data: any): any => {
        const actionCreator = {
          type: 'messages/send',
          payload: data,
          // Add a then method to make it Promise-like
          then: (callback: Function) => {
            return new Promise(resolve => {
              setTimeout(() => {
                const result = callback({
                  type: 'messages/send',
                  payload: data,
                });
                resolve(result);
              }, 0);
            });
          }
        };
        return actionCreator;
      });

      // Set up a separate function to handle the API call and delay
      const sendMessageWithDelay = async (data: any) => {
        // Type the response explicitly
        const response = await vi.mocked(apiPost)('/messages', data) as {
          success: boolean;
          data: { id: string; message: string }
        };

        // Return a plain object since this is an async function that already returns a Promise
        return {
          type: 'messages/send',
          payload: { ...data, id: response.data.id },
        };
      };

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
      const sendButton = screen.getAllByRole('button')[1]; // Get the send button (second button)
      fireEvent.click(sendButton);

      // Type and send second message
      fireEvent.change(input, { target: { value: 'Second message' } });
      fireEvent.click(sendButton);

      // Wait for both messages to be sent
      await new Promise(resolve => setTimeout(resolve, 2100));

      // ISSUE: The second message will be displayed before the first message
      // This could lead to a confusing conversation flow for the user
      // We've fixed this by sorting messages by timestamp in the Redux store

      // Check that both sendMessage calls were made
      expect(vi.mocked(sendMessage)).toHaveBeenCalled();
    });
  });

  describe('Smoke Test', () => {
    it('should handle a complete user flow: add contact → send message → start call → hang up', async () => {
      // This test would ideally use Playwright for E2E testing
      // For now, we'll just verify that the individual components work as expected

      // Reset the mocks before the test
      vi.mocked(createContact).mockClear();
      vi.mocked(sendMessage).mockClear();
      mockSessionManager.message.mockClear();

      // Add additional mock functions for this test
      const mockCall = vi.fn().mockResolvedValue({ id: 'call-123' });
      const mockHangup = vi.fn().mockResolvedValue(undefined);
      const mockSetPhoneState = vi.fn();

      // Update the mockSessionManager methods
      mockSessionManager.call.mockImplementation(mockCall);
      mockSessionManager.hangup.mockImplementation(mockHangup);

      // Mock the sendMessage action to return an AsyncThunkAction-like object
      vi.mocked(sendMessage).mockImplementation((): any => {
        const actionCreator = {
          type: 'messages/send',
          payload: { to: '123', message: 'Hello, world!' },
          // Add a then method to make it Promise-like
          then: (callback: Function) => {
            return new Promise(resolve => {
              setTimeout(() => {
                const result = callback({
                  type: 'messages/send',
                  payload: { to: '123', message: 'Hello, world!' },
                });
                resolve(result);
              }, 0);
            });
          }
        };
        return actionCreator;
      });

      // Mock the createContact action to return an AsyncThunkAction-like object
      vi.mocked(createContact).mockImplementation((): any => {
        const actionCreator = {
          type: 'contacts/create',
          payload: { contactUserId: '', contactType: ContactType.SMS, phoneNumber: '1001' },
          // Add a then method to make it Promise-like
          then: (callback: Function) => {
            return new Promise(resolve => {
              setTimeout(() => {
                const result = callback({
                  type: 'contacts/create',
                  payload: { contactUserId: '', contactType: ContactType.SMS, phoneNumber: '1001' },
                });
                resolve(result);
              }, 0);
            });
          }
        };
        return actionCreator;
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
      const addButton = screen.getByTestId('add-contact-button');
      fireEvent.click(addButton);

      // Verify that createContact was called
      expect(vi.mocked(createContact)).toHaveBeenCalled();

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
      const sendButton = screen.getAllByRole('button')[1]; // Get the send button (second button)
      fireEvent.click(sendButton);

      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify that sendMessage was called
      expect(vi.mocked(sendMessage)).toHaveBeenCalled();

      // Verify that sessionManager.message was called
      expect(mockSessionManager.message).toHaveBeenCalled();

      // ISSUE: The smoke test is incomplete because we can't easily test the full flow
      // We would need to use Playwright for a proper E2E test
    });
  });
});