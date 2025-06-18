import { Contact } from '@/types/user';
import { fetchWithAuth } from '@/utils/api';

/**
 * Get candidates based on a search query
 * @param query Search query for finding candidates
 * @param count Maximum number of candidates to return
 * @returns Promise containing an array of candidates
 */
export async function getCandidates(query: string, count: number = 5): Promise<Contact[]> {
  try {
    const response = await fetchWithAuth(`/api/users?query=${encodeURIComponent(query)}&count=${count}`);

    if (!response.ok) {
      throw new Error('Failed to fetch candidates');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
}

/**
 * Add a contact to the user's contact list
 * @param contact Contact to add
 * @returns Promise containing the updated user data
 */
export async function addContact(contact: Contact): Promise<boolean> {
  try {
    const response = await fetchWithAuth('/api/users', {
      method: 'PUT',
      body: JSON.stringify({
        action: 'add',
        number: contact.number
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add contact');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error adding contact:', error);
    return false;
  }
}

/**
 * Remove a contact from the user's contact list
 * @param contact Contact to remove
 * @returns Promise containing the updated user data
 */
export async function removeContact(contact: Contact): Promise<boolean> {
  try {
    const response = await fetchWithAuth('/api/users', {
      method: 'PUT',
      body: JSON.stringify({
        action: 'remove',
        number: contact.number
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove contact');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error removing contact:', error);
    return false;
  }
}

export async function checkExtensionNumberIsRegistered (extensionNumber: string) {
  try {
    const apiBaseUrl = process.env.BACKEND_URL || 'https://devone.telemojo.net/3cns-api';
    const response = await fetch(`${apiBaseUrl}/en/registered/${extensionNumber}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to check online status of extension number');
    }

    const data = await response.json();
    return data.data === '1';
  } catch (error) {
    console.error('Error checking online status of extension number:', error);
    return false;
  }
}