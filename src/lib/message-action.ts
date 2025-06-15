import { fetchWithAuth } from "@/utils/api";

export const fetchMessageCountByContact = async (contact: string, status: string) => {
  try {
    const res = await fetchWithAuth(
      `/api/messages/status?contact=${contact}&status=${status}`
    );
    const data = await res.json();
  
    return data.count;
  } catch(error) {
    return 0;
  }
};

export const readMessage = async (messageId: string) => {
  try {
    const res = await fetchWithAuth(
      `/api/messages`,
      {
        method: "PUT",
        body: JSON.stringify({ messageId, status: "read" }),
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error reading message:", error);
  }
};
