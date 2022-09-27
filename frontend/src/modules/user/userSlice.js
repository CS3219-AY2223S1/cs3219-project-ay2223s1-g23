import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: "",
  username: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    update: (state, action) => {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
    },
  },
});

export const { update } = userSlice.actions;

export default userSlice.reducer;
