import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { IPaginationRequest } from "../common/model";
import { ICreateSipServerRequest, ISipServer, IUpdateSipServerRequest } from "./model";
import { RootState } from "@/store";

const SIP_SERVERS_GET_LIST = "/sip-servers";
const SIP_SERVERS_POST_CREATE = "/sip-servers";
const SIP_SERVERS_PUT_UPDATE = "/sip-servers";
const SIP_SERVERS_DELETE = "/sip-servers";

export const getSipServers = createAsyncThunk<
  ISipServer[],
  IPaginationRequest | undefined,
  { state: RootState }
>(
  "sip-servers/list",
  async (req, thnukAPI) => {
    try {
      const state = thnukAPI.getState();

      const response = await apiGet(SIP_SERVERS_GET_LIST, req);

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
      return !getState().sipservers.loaded
    },
  }
);

export const createSipServer = createAsyncThunk(
  "sip-servers/create",
  async (req: ICreateSipServerRequest) => {
    try {
      const response = await apiPost(SIP_SERVERS_POST_CREATE, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);

export const updateSipServer = createAsyncThunk(
  "sip-servers/update",
  async (req: IUpdateSipServerRequest) => {
    try {
      const response = await apiPut(SIP_SERVERS_PUT_UPDATE, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);

export const deleteSipServer = createAsyncThunk(
  "sip-servers/delete",
  async (id: string) => {
    try {
      const response = await apiDelete(SIP_SERVERS_DELETE, { id: id });

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
)