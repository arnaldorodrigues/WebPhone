import { apiDelete, apiGet, apiPost } from "@/lib/apiClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ICreateContactRequest } from "./model";

const CONTACTS_GET_CANDIDATES_LIST = "/contacts/candidates";
const CONTACTS_GET_LIST = "/contacts";
const CONTACTS_POST_CREATE = "/contacts";
const CONTACTS_DELETE = "/contacts";

export const getCandidates = createAsyncThunk(
  "contacts/candidates",
  async (searchQuery?: string) => {
    try {
      const response = await apiGet(`${CONTACTS_GET_CANDIDATES_LIST}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);

export const getContacts = createAsyncThunk(
  "contacts/list",
  async () => {
    try {
      const response = await apiGet(CONTACTS_GET_LIST);

      if (response.success && response.data) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);

export const createContact = createAsyncThunk(
  "contacts/create",
  async (req: ICreateContactRequest) => {
    try {
      const response = await apiPost(CONTACTS_POST_CREATE, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
)

export const deleteContact = createAsyncThunk(
  "contacts/delete",
  async (id: string) => {
    try {
      const response = await apiDelete(CONTACTS_DELETE, { id: id });

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
)