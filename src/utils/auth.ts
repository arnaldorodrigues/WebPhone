import Cookies from 'js-cookie';

export const setToken = (token: string) => {
  Cookies.set('authToken', token, { expires: 1, secure: true, sameSite: 'strict'});
};

export const getToken = () => {
  return Cookies.get('authToken');
};

export const removeToken = () => {
  Cookies.remove('authToken');
};

export const isAuthenticated = () => {
  return !!getToken();
}; 

export const getParsedToken = () => {
  const token = getToken();
  
  return token ? _parse_token(token) : null
};

export const _parse_token = (t:string) => {
  try {
    const [, payload] = t.split('.');
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}