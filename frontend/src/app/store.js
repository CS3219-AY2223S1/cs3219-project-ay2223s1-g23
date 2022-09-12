import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../modules/user/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
