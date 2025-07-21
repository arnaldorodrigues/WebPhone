import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet, apiPost } from "@/lib/apiClient";

const MESSAGES_GET_LIST = "/messages";
const MESSAGES_POST_SEND = "/messages";

export const getMessages = createAsyncThunk(
  "messages/list",
  async (contactId: string) => {
    try {
      const response = await apiGet(`${MESSAGES_GET_LIST}?contact=${contactId}`);

      if (response.success && response.data) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/send",
  async (req: {
    to: string,
    message: string,
  }) => {
    try {
      const response = await apiPost(MESSAGES_POST_SEND, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);