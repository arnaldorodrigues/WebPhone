import { getAuthToken } from "@/utils/auth";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const headers = () => {
  const token = getAuthToken();

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const apiGet = async <T = any>(url: string): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok)
    throw new Error(`Get ${url} failed with status ${res.status}`);

  return res.json();
};

export const apiPost = async <T = any>(url: string, body: any): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok)
    throw new Error(`POST ${url} failed with status ${res.status}`);

  return res.json();
}

