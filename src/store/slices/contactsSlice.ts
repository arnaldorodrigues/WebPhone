import { ICandidateItem, IContactItem } from "@/core/contacts/model"
import { createContact, deleteContact, getCandidates, getContacts } from "@/core/contacts/request";
import { IMessageItem } from "@/core/messages/model";
import { getMessages, sendMessage } from "@/core/messages/request";
import { createSlice } from "@reduxjs/toolkit";

type ContactsState = {
  contacts: IContactItem[];
  messages: IMessageItem[];
  candidates: ICandidateItem[];
  selectedContact: IContactItem | undefined;
  loading: boolean;
  loadingMessages: boolean;
  loaded: boolean;
}

const initialState: ContactsState = {
  contacts: [],
  messages: [],
  candidates: [],
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
      .addCase(getCandidates.pending, (state) => {
        state.candidates = [];
      })
      .addCase(getCandidates.fulfilled, (state, action) => {
        state.candidates = action.payload;
      })
      .addCase(getCandidates.rejected, (state) => {
        state.messages = [];
      })
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
      .addCase(sendMessage.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loadingMessages = false;
        // Add the new message to the array
        state.messages = [...state.messages, action.payload];
        // Sort messages by timestamp to handle out-of-order responses
        state.messages.sort((a, b) => {
          const timestampA = new Date(a.timestamp).getTime();
          const timestampB = new Date(b.timestamp).getTime();
          return timestampA - timestampB;
        });
      })
      .addCase(sendMessage.rejected, (state) => {
        state.loadingMessages = false;
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
      .addCase(createContact.fulfilled, (state, _action) => {
        state.loaded = false;
      })
      .addCase(createContact.rejected, (state) => {
        state.loaded = false;
      })
      .addCase(deleteContact.pending, (state) => {
        state.loaded = false;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.loaded = true;
        const deletedContact = action.payload;
        state.contacts = state.contacts.filter(s => s.id !== deletedContact._id);
      })
      .addCase(deleteContact.rejected, (state) => {
        state.loaded = false;
      })
  }
});

export const {
  setSelectedContact,
  clearSelectedContact
} = contactsSlice.actions;

export default contactsSlice.reducer;