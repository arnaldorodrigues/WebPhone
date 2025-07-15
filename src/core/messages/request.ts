import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGet } from "@/lib/apiClient";

const MESSAGES_GET_LIST = "/messages";

export const getMessages = createAsyncThunk(
  "messages/list",
  async (req: {
    contactId: string,
    contactType: string
  }) => {
    try {
      const response = await apiGet(`${MESSAGES_GET_LIST}?contact=${req.contactId}&type=${req.contactType}`);

      if (response.success && response.data) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);