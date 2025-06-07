import Cookies from 'js-cookie';

export const setToken = (token: string) => {
  Cookies.set('authToken', token, { expires: 1, secure: true, sameSite: 'strict'});
};

export const getToken = () => {
  return Cookies.get('authToken');
};

export const removeToken = () => {
  Cookies.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getToken();
}; 

export const getParsedToken = () => {
  const token = getToken();
  
  return _parse_token(token)
};

export const _parse_token = (t:string) => {
  try {
    // Split the JWT token into its parts
    const [, payload] = t.split('.');
    // Decode the base64 payload
    const decodedPayload = atob(payload);
    // Parse the JSON payload
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}