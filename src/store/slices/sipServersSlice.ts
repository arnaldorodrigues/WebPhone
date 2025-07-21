import { ISipServer } from "@/core/sip-servers/model";
import { createSipServer, deleteSipServer, getSipServers, updateSipServer } from "@/core/sip-servers/request";
import { createSlice } from "@reduxjs/toolkit";

type SipServersState = {
  sipservers: ISipServer[];
  loading: boolean;
  loaded: boolean;
}

const initialState: SipServersState = {
  sipservers: [],
  loading: false,
  loaded: false,
}

const sipServersSlice = createSlice({
  name: 'sipservers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSipServers.pending, (state) => {
        state.loading = true;
        state.loaded = false;
      })
      .addCase(getSipServers.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.sipservers = action.payload;
      })
      .addCase(getSipServers.rejected, (state) => {
        state.loading = false;
        state.loaded = false;
      })
      .addCase(updateSipServer.pending, (state) => {
        state.loaded = false;
      })
      .addCase(updateSipServer.fulfilled, (state, action) => {
        const updatedServer = action.payload;
        const index = state.sipservers.findIndex(s => s._id === updatedServer._id);
        if (index !== -1) {
          state.sipservers[index] = updatedServer;
        }
        state.loaded = true;
      })
      .addCase(updateSipServer.rejected, (state) => {
        state.loaded = true;
      })
      .addCase(createSipServer.pending, (state) => {
        state.loaded = false;
      })
      .addCase(createSipServer.fulfilled, (state, action) => {
        state.sipservers = [...state.sipservers, action.payload];
        state.loaded = true;
      })
      .addCase(createSipServer.rejected, (state) => {
        state.loaded = true;
      })
      .addCase(deleteSipServer.pending, (state) => {
        state.loaded = false;
      })
      .addCase(deleteSipServer.fulfilled, (state, action) => {
        const deletedServer = action.payload;
        state.sipservers = state.sipservers.filter(s => s._id !== deletedServer._id);
      })
      .addCase(deleteSipServer.rejected, (state) => {
        state.loaded = true;
      })
  },
});

export default sipServersSlice.reducer;