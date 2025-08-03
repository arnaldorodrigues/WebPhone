import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddContactDialog from '../AddContactDialog';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ContactType } from '@/types/common';
import { ICandidateItem } from '@/core/contacts/model';

// Import the modules that will be mocked
import { createContact } from '@/core/contacts/request';

// Define interface for typing
interface Candidate {
  id: string;
  name: string;
  sipUsername: string;
  contactType?: ContactType;
}

// Mock the createContact action using a factory function
vi.mock('@/core/contacts/request', () => {
  // Create a mock function that returns a thunk-compatible action
  const mockCreateContact = vi.fn().mockImplementation((data) => {
    // Return a function that Redux Thunk can handle
    return (dispatch: any) => {
      // Dispatch a plain object action that Redux can process
      dispatch({
        type: 'contacts/create',
        payload: data
      });
      // Return a resolved promise to simulate async behavior
      return Promise.resolve({ data });
    };
  });
  
  return {
    createContact: mockCreateContact
  };
});

// Get a reference to the mocked function
const mockCreateContact = vi.mocked(createContact);

// Mock Redux store
const createMockStore = (candidates: Candidate[] = []) => {
  return configureStore({
    reducer: {
      contactsdata: (state = { candidates }, action) => {
        // Handle contact creation actions if needed
        if (action.type === 'contacts/create') {
          return {
            ...state,
            loading: false,
            error: null
          };
        }
        return state;
      },
      userdata: (state = { 
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
        loaded: true 
      }, action) => state,
    },
    // Add middleware configuration to explicitly support thunks
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      thunk: {
        extraArgument: {}
      },
      serializableCheck: {
        // Ignore non-serializable values in actions
        ignoredActions: ['contacts/create', 'contacts/create/pending', 'contacts/create/fulfilled', 'contacts/create/rejected'],
      },
    }),
  });
};

describe('AddContactDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog when isOpen is true', async () => {
    const store = createMockStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('add-contact-button')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search by name or number...')).toBeInTheDocument();
    });
  });

  it('should not render the dialog when isOpen is false', () => {
    const store = createMockStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={false} onClose={onClose} />
      </Provider>
    );

    expect(screen.queryByTestId('add-contact-button')).not.toBeInTheDocument();
  });

  it('should disable the Add Contact button when search query is empty', async () => {
    const store = createMockStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    await waitFor(() => {
      const addButton = screen.getByTestId('add-contact-button');
      expect(addButton).toBeDisabled();
    });
  });

  it('should enable the Add Contact button when search query is not empty', async () => {
    const store = createMockStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or number...');
    fireEvent.change(searchInput, { target: { value: '1001' } });

    await waitFor(() => {
      const addButton = screen.getByTestId('add-contact-button');
      expect(addButton).not.toBeDisabled();
    });
  });

  it('should display candidates when search query matches', () => {
    const candidates = [
      {
        id: '1',
        name: 'Test User',
        sipUsername: '1001',
      },
      {
        id: '2',
        name: 'Another User',
        sipUsername: '1002',
      },
    ];
    
    const store = createMockStore(candidates);
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or number...');
    fireEvent.change(searchInput, { target: { value: '100' } });

    // Wait for the candidates to be filtered
    waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Another User')).toBeInTheDocument();
    });
  });

  it('should call createContact with WebRTC type when a candidate is selected', async () => {
    // Reset the mock before the test
    mockCreateContact.mockClear();
    
    const candidates = [
      {
        id: '1',
        name: 'Test User',
        sipUsername: '1001',
      },
    ];
    
    const store = createMockStore(candidates);
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or number...');
    fireEvent.change(searchInput, { target: { value: '100' } });

    // Wait for the candidates to be filtered and click on the first one
    await waitFor(() => {
      const candidateButton = screen.getByText('Test User').closest('button')!;
      fireEvent.click(candidateButton);
    });

    // Click the Add Contact button
    const addButton = screen.getByTestId('add-contact-button');
    fireEvent.click(addButton);

    // Verify createContact was called with the correct parameters
    expect(mockCreateContact).toHaveBeenCalledWith({
      contactUserId: '1',
      contactType: ContactType.WEBRTC,
      sipNumber: '1001',
    });

    // Verify onClose was called
    expect(onClose).toHaveBeenCalled();
  });

  it('should call createContact with SMS type when no candidate is selected', async () => {
    // Reset the mock before the test
    mockCreateContact.mockClear();
    
    const store = createMockStore([]);
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or number...');
    fireEvent.change(searchInput, { target: { value: '1001' } });

    // Click the Add Contact button
    const addButton = screen.getByTestId('add-contact-button');
    fireEvent.click(addButton);

    // Verify createContact was called with the correct parameters
    expect(mockCreateContact).toHaveBeenCalledWith({
      contactUserId: '',
      contactType: ContactType.SMS,
      phoneNumber: '1001',
    });

    // Verify onClose was called
    expect(onClose).toHaveBeenCalled();
  });

  it('should handle errors when createContact fails', async () => {
    const store = createMockStore([]);
    const onClose = vi.fn();
    
    // Mock createContact to throw an error
    mockCreateContact.mockImplementationOnce(() => {
      throw new Error('Failed to create contact');
    });

    // Spy on console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or number...');
    fireEvent.change(searchInput, { target: { value: '1001' } });

    // Click the Add Contact button
    const addButton = screen.getByTestId('add-contact-button');
    fireEvent.click(addButton);

    // The dialog closes immediately as specified in the component code
    expect(onClose).toHaveBeenCalled();

    // Verify the error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should handle delayed contact creation with feedback', async () => {
    const store = createMockStore([]);
    const onClose = vi.fn();
    
    // Mock createContact to delay
    mockCreateContact.mockImplementationOnce((data: any): any => {
      // Return a function that Redux Thunk can handle with a delay
      return (dispatch: any) => {
        // Return a Promise that resolves after a delay
        return new Promise(resolve => {
          setTimeout(() => {
            dispatch({
              type: 'contacts/create',
              payload: data
            });
            resolve({ data });
          }, 1000);
        });
      };
    });

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or number...');
    fireEvent.change(searchInput, { target: { value: '1001' } });

    // Click the Add Contact button
    const addButton = screen.getByTestId('add-contact-button');
    fireEvent.click(addButton);

    // Verify that createContact was called with the correct parameters
    expect(mockCreateContact).toHaveBeenCalledWith({
      contactUserId: '',
      contactType: ContactType.SMS,
      phoneNumber: '1001',
    });

    // Verify that the success message is shown
    await waitFor(() => {
      expect(screen.getByText('Contact added successfully!')).toBeInTheDocument();
    });

    // Wait for the dialog to close (1.5 seconds after success)
    await new Promise(resolve => setTimeout(resolve, 1600));

    // Verify that onClose was called after the delay
    expect(onClose).toHaveBeenCalled();
  });
});