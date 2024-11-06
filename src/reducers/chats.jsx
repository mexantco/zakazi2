import { createSlice } from "@reduxjs/toolkit";

const chats = createSlice({
  name: "chats",
  initialState: {},
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload.chats;
      
    },
  },
});

export const setChats = chats.actions.setChats;
export default chats.reducer;
