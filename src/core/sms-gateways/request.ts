import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/apiClient";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { IPaginationRequest } from "../common/model";
import { RootState } from "@/store";
import { ICreateSmsGatewayRequest, ISmsGatewayItem, IUpdateSmsGatewayRequest } from "./model";

const SMS_GATEWAYS_GET_LIST = "/sms-gateways";
const SMS_GATEWAYS_POST_CREATE = "/sms-gateways";
const SMS_GATEWAYS_PUT_UPDATE = "/sms-gateways";
const SMS_GATEWAYS_DELETE = "/sms-gateways";

export const getSmsGateways = createAsyncThunk<
  ISmsGatewayItem[],
  IPaginationRequest | undefined,
  { state: RootState }
>(
  "sms-gateways/list",
  async (req, thnukAPI) => {
    try {
      const state = thnukAPI.getState();

      const response = await apiGet(SMS_GATEWAYS_GET_LIST, req);

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
      return !getState().smsgateways.loaded
    },
  }
);

export const createSmsGateway = createAsyncThunk(
  "sms-gateways/create",
  async (req: ICreateSmsGatewayRequest) => {
    try {
      const response = await apiPost(SMS_GATEWAYS_POST_CREATE, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);

export const updateSmsGateway = createAsyncThunk(
  "sms-gateways/update",
  async (req: IUpdateSmsGatewayRequest) => {
    try {
      const response = await apiPut(SMS_GATEWAYS_PUT_UPDATE, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);

export const deleteSmsGateway = createAsyncThunk(
  "sms-gateways/delete",
  async (id: string) => {
    try {
      const response = await apiDelete(SMS_GATEWAYS_DELETE, { id: id });

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
)