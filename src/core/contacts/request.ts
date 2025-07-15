import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { IContactItem, ICreateContactRequest } from "./model";
import { RootState } from "@/store";

const CONTACTS_GET_CANDIDATES_LIST = "/contacts/candidates";
const CONTACTS_GET_LIST = "/contacts";
const CONTACTS_POST_CREATE = "/contacts";

export const getCandidates = createAsyncThunk(
  "contacts/candidates",
  async (searchQuery: string) => {
    try {
      const response = await apiGet(`${CONTACTS_GET_CANDIDATES_LIST}?search=${encodeURIComponent(searchQuery)}`);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
)

export const getContacts = createAsyncThunk<
  IContactItem[],
  void,
  { state: RootState }
>(
  "contacts/list",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();

      const response = await apiGet(CONTACTS_GET_LIST);

      if (response.success && response.data) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      return !getState().contactsdata.loaded
    },
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