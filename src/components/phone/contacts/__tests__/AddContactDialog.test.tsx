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

// Create a mock for createContact
const mockCreateContact = vi.fn().mockImplementation((data) => ({
  type: 'contacts/create',
  payload: data,
}));

// Mock the createContact action
vi.mock('@/core/contacts/request', () => ({
  createContact: (data) => mockCreateContact(data),
}));

// Mock Redux store
const createMockStore = (candidates: Candidate[] = []) => {
  return configureStore({
    reducer: {
      contactsdata: (state = { candidates }, action) => state,
    },
  });
};

describe('AddContactDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog when isOpen is true', () => {
    const store = createMockStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    expect(screen.getByTestId('add-contact-button')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name or number...')).toBeInTheDocument();
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

  it('should disable the Add Contact button when search query is empty', () => {
    const store = createMockStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const addButton = screen.getByTestId('add-contact-button');
    expect(addButton).toBeDisabled();
  });

  it('should enable the Add Contact button when search query is not empty', () => {
    const store = createMockStore();
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or number...');
    fireEvent.change(searchInput, { target: { value: '1001' } });

    const addButton = screen.getByTestId('add-contact-button');
    expect(addButton).not.toBeDisabled();
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
    const addButton = screen.getByRole('button', { name: 'Add Contact' });
    fireEvent.click(addButton);

    // Verify createContact was called with the correct parameters
    expect(mockCreateContact).toHaveBeenCalledWith({
      contactUserId: '1',
      contactType: ContactType.WEBRTC,
      sipNumber: '1001',
    });

    // Verify onClose was called
    expect(onClose).toHaveBeenCalled();

    // ISSUE: No loading indicator or success message is shown to the user
    // The dialog simply closes without any feedback
    expect(screen.queryByText(/adding/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/success/i)).not.toBeInTheDocument();
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
    const addButton = screen.getByRole('button', { name: 'Add Contact' });
    fireEvent.click(addButton);

    // Verify createContact was called with the correct parameters
    expect(mockCreateContact).toHaveBeenCalledWith({
      contactUserId: '',
      contactType: ContactType.SMS,
      phoneNumber: '1001',
    });

    // Verify onClose was called
    expect(onClose).toHaveBeenCalled();

    // ISSUE: No loading indicator or success message is shown to the user
    // The dialog simply closes without any feedback
    expect(screen.queryByText(/adding/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/success/i)).not.toBeInTheDocument();
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
    const addButton = screen.getByRole('button', { name: 'Add Contact' });
    fireEvent.click(addButton);

    // ISSUE: The dialog still closes even if there's an error
    // No error message is shown to the user
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should handle delayed contact creation without feedback', async () => {
    const store = createMockStore([]);
    const onClose = vi.fn();
    
    // Mock createContact to delay
    mockCreateContact.mockImplementationOnce((data: any): any => {
      // Return an object that matches the AsyncThunkAction interface
      // but also has a Promise-like structure for chaining
      const actionCreator = {
        type: 'contacts/create',
        payload: data,
        // Add a then method to make it Promise-like
        then: (callback: Function) => {
          return new Promise(resolve => {
            // Simulate a network delay
            setTimeout(() => {
              const result = callback({
                type: 'contacts/create',
                payload: data,
              });
              resolve(result);
            }, 1000);
          });
        }
      };
      return actionCreator;
    });

    render(
      <Provider store={store}>
        <AddContactDialog isOpen={true} onClose={onClose} />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Search by name or number...');
    fireEvent.change(searchInput, { target: { value: '1001' } });

    // Click the Add Contact button
    const addButton = screen.getByRole('button', { name: 'Add Contact' });
    fireEvent.click(addButton);

    // ISSUE: The dialog closes immediately, without waiting for the contact to be created
    // No loading indicator is shown during the delay
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByText(/adding/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});