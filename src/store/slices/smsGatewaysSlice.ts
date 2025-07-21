import { ISmsGatewayItem } from "@/core/sms-gateways/model";
import { createSmsGateway, deleteSmsGateway, getSmsGateways, updateSmsGateway } from "@/core/sms-gateways/request";
import { createSlice } from "@reduxjs/toolkit";

type SmsGatewaysState = {
  smsgateways: ISmsGatewayItem[];
  loading: boolean;
  loaded: boolean;
}

const initialState: SmsGatewaysState = {
  smsgateways: [],
  loading: false,
  loaded: false,
}

const smsGatewaysSlice = createSlice({
  name: 'smsgateways',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSmsGateways.pending, (state) => {
        state.loading = true;
        state.loaded = false;
      })
      .addCase(getSmsGateways.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.smsgateways = action.payload;
      })
      .addCase(getSmsGateways.rejected, (state) => {
        state.loading = false;
        state.loaded = false;
      })
      .addCase(updateSmsGateway.pending, (state) => {
        state.loaded = false;
      })
      .addCase(updateSmsGateway.fulfilled, (state, action) => {
        const updatedGateway = action.payload;
        const index = state.smsgateways.findIndex(s => s._id === updatedGateway._id);
        if (index !== -1) {
          state.smsgateways[index] = updatedGateway;
        }
        state.loaded = true;
      })
      .addCase(updateSmsGateway.rejected, (state) => {
        state.loaded = true;
      })
      .addCase(createSmsGateway.pending, (state) => {
        state.loaded = false;
      })
      .addCase(createSmsGateway.fulfilled, (state, action) => {
        state.smsgateways = [...state.smsgateways, action.payload];
        state.loaded = true;
      })
      .addCase(createSmsGateway.rejected, (state) => {
        state.loaded = true;
      })
      .addCase(deleteSmsGateway.pending, (state) => {
        state.loaded = false;
      })
      .addCase(deleteSmsGateway.fulfilled, (state, action) => {
        const deletedGateway = action.payload;
        state.smsgateways = state.smsgateways.filter(s => s._id !== deletedGateway._id);
      })
      .addCase(deleteSmsGateway.rejected, (state) => {
        state.loaded = true;
      })
  },
});

export default smsGatewaysSlice.reducer;