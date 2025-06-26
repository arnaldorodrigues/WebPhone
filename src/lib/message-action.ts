import { Contact } from "@/types/user";
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

export const fetchMessage = async (contactId: string) =>{ 
   try {
    const response = await fetchWithAuth(`/api/messages?contact=${contactId}`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

export const fetchMessageCountByContact = async (contact: string, status: string) => {
  try {
    const response = await fetchWithAuth(
      `/api/messages/status?contact=${contact}&status=${status}`
    );
    const data = await response.json();
    return data.success ? data.count : 0;
  } catch (error) {
    console.error("Error fetching message count:", error);
    return 0;
  }
};

export const fetchContactMessages = async (contact: string) => {
  try {
    const response = await fetchWithAuth(`/api/messages?contact=${contact}`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const sendMessage = async (to: Contact, messageBody: string, sessionManager: any, domain: string) => {
  try {

    if(!sessionManager || domain.length === 0) throw new Error("Session manager or domain not found");

    if (sessionManager) {
      await sessionManager.message(
        `sip:${to.number}@${domain}`,
        messageBody
      );
    }
    const response = await fetchWithAuth('/api/messages', {
      method: "POST",
      body: JSON.stringify({ to: to.id, messageBody }),
    });

    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};

export async function sendSMSMessage(to: string, messageBody: string) {
  try {
    const response = await fetchWithAuth('/api/sms', {
        method: "POST",
        body: JSON.stringify({to, messageBody }),
      });
    
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error sending SMS message:", error);
    return null;
  }
}

export const getGatewayNumber = async () => {
  try {
    const response = await fetchWithAuth('/api/sms/gateway/signalwire');
    const data = await response.json();
    return data.success ? data.phoneNumber : null;
  } catch (error) {
    console.error("Error fetching gateway number:", error);
    return null;
  }
};