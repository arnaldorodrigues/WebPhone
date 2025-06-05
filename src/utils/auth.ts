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