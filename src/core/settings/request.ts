import { createAsyncThunk } from "@reduxjs/toolkit";
import { IUpdateSettingRequest } from "./model";
import { apiPut } from "@/lib/apiClient";

const SETTINGS_PUT_UPDATE = "/settings";

export const updateSetting = createAsyncThunk(
  "settings/update",
  async (req: IUpdateSettingRequest) => {
    try {
      const response = await apiPut(SETTINGS_PUT_UPDATE, req);

      if (response.success) {
        return response.data;
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
);