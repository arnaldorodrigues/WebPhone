import { IContactItem } from "@/core/contacts/model"
import { createContact, getContacts } from "@/core/contacts/request";
import { IMessageItem } from "@/core/messages/model";
import { getMessages } from "@/core/messages/request";
import { createSlice } from "@reduxjs/toolkit";

type ContactsState = {
  contacts: IContactItem[];
  messages: IMessageItem[];
  selectedContact: IContactItem | undefined;
  loading: boolean;
  loadingMessages: boolean;
  loaded: boolean;
}

const initialState: ContactsState = {
  contacts: [],
  messages: [],
  selectedContact: undefined,
  loading: false,
  loadingMessages: false,
  loaded: false,
}

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSelectedContact: (state, action) => {
      state.selectedContact = action.payload;
    },
    clearSelectedContact: (state) => {
      state.selectedContact = undefined;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state) => {
        state.loadingMessages = false;
        state.messages = [];
      })
      .addCase(getContacts.pending, (state) => {
        state.loading = true;
        state.loaded = false;
      })
      .addCase(getContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.contacts = action.payload;
      })
      .addCase(getContacts.rejected, (state) => {
        state.loading = false;
        state.loaded = false;
        state.contacts = [];
      })
      .addCase(createContact.pending, (state) => {
        state.loaded = false;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.loaded = true;
        state.contacts = [...state.contacts, action.payload];
      })
      .addCase(createContact.rejected, (state) => {
        state.loaded = false;
      })
  }
});

export const {
  setSelectedContact,
  clearSelectedContact
} = contactsSlice.actions;

export default contactsSlice.reducer;