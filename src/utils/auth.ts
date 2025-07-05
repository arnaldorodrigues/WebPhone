import jwt, { SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const signToken = (
  payload: IJwtPayload,
): string => {
  const options: SignOptions = { expiresIn: '1d' };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }

  return null;
}

// export const parseToken = (t:string) => {
//   try {
//     const [, payload] = t.split('.');
//     const decodedPayload = atob(payload);
//     return JSON.parse(decodedPayload);
//   } catch (error) {
//     console.error('Error parsing token:', error);
//     return null;
//   }
// }


// export const setToken = (token: string) => {
//   Cookies.set('authToken', token, { expires: 1, secure: true, sameSite: 'strict'});
// };

// export const getToken = () => {
//   return Cookies.get('authToken');
// };

// export const removeToken = () => {
//   Cookies.remove('authToken');
// };

// export const isAuthenticated = () => {
//   return !!getToken();
// }; 

// export const getParsedToken = () => {
//   const token = getToken();
  
//   return token ? _parse_token(token) : null
// };



