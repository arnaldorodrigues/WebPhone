import { IUserData } from "@/core/users/model"
import { getUserData } from "@/core/users/request";
import { createSlice } from "@reduxjs/toolkit";

type UserDataState = {
  userData: IUserData | undefined;
  loading: boolean;
  loaded: boolean;
}

const initialState: UserDataState = {
  userData: undefined,
  loading: false,
  loaded: false,
}

const userDataSlice = createSlice({
  name: 'userdata',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserData.pending, (state) => {
        state.loading = true;
        state.loaded = false;
      })
      .addCase(getUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.userData = action.payload;
      })
      .addCase(getUserData.rejected, (state) => {
        state.loading = false;
        state.loaded = false;
        state.userData = undefined;
      })
  }
});

export default userDataSlice.reducer;