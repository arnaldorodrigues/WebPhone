import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhoneControl } from '../PhoneControl';
import { SipStatus } from '@/types/siptypes';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { IUserData } from '@/core/users/model';

// Create a partial type for test userData objects
type TestUserData = Partial<IUserData> & {
  name: string;
  sipUsername: string;
  sipPassword: string;
  wsServer: string;
  wsPort: string;
  wsPath: string;
  domain: string;
};

// Mock the contexts
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: '123', userName: 'Test User' },
    logout: vi.fn(),
  }),
}));

vi.mock('@/contexts/SipContext', () => ({
  useSip: () => ({
    connectAndRegister: vi.fn(),
    disconnect: vi.fn(),
    sipStatus: vi.mocked(sipStatus),
    setPhoneState: vi.fn(),
    phoneState: null,
  }),
}));

// Mock the getUserData request
vi.mock('@/core/users/request', () => ({
  getUserData: vi.fn(),
}));

// Mock Redux store
const createMockStore = (userData: TestUserData | null = null, loading = false, loaded = false) => {
  return configureStore({
    reducer: {
      userdata: (state = { userData, loading, loaded }, action) => state,
    },
  });
};

// Mock SIP status
let sipStatus = SipStatus.UNREGISTERED;

describe('PhoneControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sipStatus = SipStatus.UNREGISTERED;
  });

  it('should display offline status when SIP is unregistered', () => {
    const store = createMockStore({ 
      name: 'Test User', 
      sipUsername: 'test', 
      sipPassword: 'password',
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      domain: 'test.com'
    });

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('should display online status when SIP is registered', () => {
    sipStatus = SipStatus.REGISTERED;
    
    const store = createMockStore({ 
      name: 'Test User', 
      sipUsername: 'test', 
      sipPassword: 'password',
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      domain: 'test.com'
    });

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });

  it('should display "Not Configured" when SIP username is missing', () => {
    const store = createMockStore({ 
      name: 'Test User', 
      sipUsername: '', 
      sipPassword: 'password',
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      domain: 'test.com'
    });

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    expect(screen.getByText('Not Configured')).toBeInTheDocument();
  });

  it('should disable register button when userData is loading', () => {
    const store = createMockStore(null, true, false);

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    // Find the register button (it has an ArrowPathIcon)
    const registerButton = screen.getByTitle(/Register|Unregister/i);
    expect(registerButton).toBeDisabled();
  });

  it('should call connectAndRegister when register button is clicked', async () => {
    const { useSip } = await import('@/contexts/SipContext');
    const mockConnectAndRegister = vi.fn();
    vi.mocked(useSip).mockReturnValue({
      ...vi.mocked(useSip)(),
      connectAndRegister: mockConnectAndRegister,
    });

    const store = createMockStore({ 
      name: 'Test User', 
      sipUsername: 'test', 
      sipPassword: 'password',
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      domain: 'test.com'
    });

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    // Find the register button
    const registerButton = screen.getByTitle('Register');
    fireEvent.click(registerButton);

    expect(mockConnectAndRegister).toHaveBeenCalledWith({
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      server: 'test.com',
      username: 'test',
      password: 'password',
      displayName: 'Test User',
    });
  });

  it('should call disconnect when unregister button is clicked', async () => {
    sipStatus = SipStatus.REGISTERED;
    
    const { useSip } = await import('@/contexts/SipContext');
    const mockDisconnect = vi.fn();
    vi.mocked(useSip).mockReturnValue({
      ...vi.mocked(useSip)(),
      sipStatus: SipStatus.REGISTERED,
      disconnect: mockDisconnect,
    });

    const store = createMockStore({ 
      name: 'Test User', 
      sipUsername: 'test', 
      sipPassword: 'password',
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      domain: 'test.com'
    });

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    // Find the unregister button
    const unregisterButton = screen.getByTitle('Unregister');
    fireEvent.click(unregisterButton);

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should open settings dialog when settings button is clicked', () => {
    const store = createMockStore({ 
      name: 'Test User', 
      sipUsername: 'test', 
      sipPassword: 'password',
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      domain: 'test.com'
    });

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    // Find the settings button
    const settingsButton = screen.getByTitle('Settings');
    fireEvent.click(settingsButton);

    // The dialog should be visible (implementation depends on the actual dialog component)
    // This is a simplified check - you might need to adjust based on your dialog implementation
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });

  it('should set phone state to "dialing" when call button is clicked', async () => {
    const { useSip } = await import('@/contexts/SipContext');
    const mockSetPhoneState = vi.fn();
    vi.mocked(useSip).mockReturnValue({
      ...vi.mocked(useSip)(),
      setPhoneState: mockSetPhoneState,
    });

    const store = createMockStore({ 
      name: 'Test User', 
      sipUsername: 'test', 
      sipPassword: 'password',
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      domain: 'test.com'
    });

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    // Find the call button
    const callButton = screen.getByText('Call');
    fireEvent.click(callButton);

    expect(mockSetPhoneState).toHaveBeenCalledWith('dialing');
  });

  it('should call logout when logout button is clicked', async () => {
    const { useAuth } = await import('@/contexts/AuthContext');
    const mockLogout = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      logout: mockLogout,
    });

    const store = createMockStore({ 
      name: 'Test User', 
      sipUsername: 'test', 
      sipPassword: 'password',
      wsServer: 'wss://test.com',
      wsPort: '8089',
      wsPath: '/ws',
      domain: 'test.com'
    });

    render(
      <Provider store={store}>
        <PhoneControl />
      </Provider>
    );

    // Find the logout button
    const logoutButton = screen.getByTitle('Sign out');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});