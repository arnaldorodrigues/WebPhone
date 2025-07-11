import { apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { ICreateUserRequest, IUpdateUserRequest } from "./model";
import { createAsyncThunk } from "@reduxjs/toolkit";

const USERS_GET_LIST = "/users";
const USERS_POST_CREATE = "/users";
const USERS_PUT_UPDATE = "/users";

export const getUsersList = async () => {
  try {
    const response = await apiGet(USERS_GET_LIST);

    if (response.success) {
      return response;
    }
  } catch (error) {
    console.error(error);
  }
}

export const createUser = createAsyncThunk(
  "users/create",
  async (req: ICreateUserRequest) => {
    try {
      const response = await apiPost(USERS_POST_CREATE, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
)

export const updateUser = createAsyncThunk(
  "users/update",
  async (req: IUpdateUserRequest) => {
    try {
      const response = await apiPut(USERS_PUT_UPDATE, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
)