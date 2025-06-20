import { fetchWithAuth } from "@/utils/api";

export const readMessage = async (messageId: string) => {
  try {
    const response = await fetchWithAuth("/api/messages", {
      method: "PUT",
      body: JSON.stringify({
        messageId,
        status: "read",
      }),
    });
    return response.json();
  } catch (error) {
    console.error("Error setting message as read:", error);
    return null;
  }
};

export const fetchMessageCountByContact = async (contactId: string, status: string) => {
  try {
    const response = await fetchWithAuth(
      `/api/messages/status?contact=${contactId}&status=${status}`
    );
    const data = await response.json();
    return data.success ? data.count : 0;
  } catch (error) {
    console.error("Error fetching message count:", error);
    return 0;
  }
};

export const fetchContactMessages = async (contactId: string) => {
  try {
    const response = await fetchWithAuth(`/api/messages?contact=${contactId}`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (to: string, messageBody: string, type: 'chat' | 'sms' = 'chat') => {
  try {
    const endpoint = type === 'sms' ? '/api/sms' : '/api/messages';
    const body = type === 'sms' ? { to, message: messageBody } : { to, messageBody };

    const response = await fetchWithAuth(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (data.success) {
      return type === 'sms' ? data.message : data.data;
    }
    return null;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};

export const fetchSMSMessages = async (contactNumber: string) => {
  try {
    const response = await fetch(`/api/sms/messages?contact=${contactNumber}`);
    const data = await response.json();
    if (data.success) {
      // Transform SMS messages to match chat message format
      return data.data.map((sms: any) => ({
        _id: sms._id,
        body: sms.message,
        from: sms.from,
        to: sms.to,
        timestamp: sms.timestamp,
        type: 'sms'
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching SMS messages:', error);
    return [];
  }
};

export const sendSMS = async (to: string, message: string) => {
  try {
    const response = await fetch('/api/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message }),
    });
    const data = await response.json();
    if (data.success) {
      return {
        _id: data.sms._id,
        body: data.sms.message,
        from: data.sms.from,
        to: data.sms.to,
        timestamp: data.sms.timestamp,
        type: 'sms'
      };
    }
    return null;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return null;
  }
};

