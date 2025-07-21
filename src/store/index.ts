import { configureStore } from "@reduxjs/toolkit";
import sipServersReducer from './slices/sipServersSlice';
import smsGatewaysReducer from "./slices/smsGatewaysSlice";
import userDataReducer from "./slices/userDataSlice";
import contactsReducer from "./slices/contactsSlice";

export const store = configureStore({
  reducer: {
    sipservers: sipServersReducer,
    smsgateways: smsGatewaysReducer,
    userdata: userDataReducer,
    contactsdata: contactsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;