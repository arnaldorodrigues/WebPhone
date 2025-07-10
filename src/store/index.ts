import { configureStore } from "@reduxjs/toolkit";
import sipServersReducer from './slices/sipServersSlice';
import smsGatewaysReducer from "./slices/smsGatewaysSlice";

export const store = configureStore({
  reducer: {
    sipservers: sipServersReducer,
    smsgateways: smsGatewaysReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;