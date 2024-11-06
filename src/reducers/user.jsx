import { createSlice } from "@reduxjs/toolkit";

const user = createSlice({
  name: "user",
  initialState: {},
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload.userData;
      
    },
    setOrder: (state, action) => {
        state.order = action.payload.order;
        
      },
    },
   
  }
);

export const setUserData = user.actions.setUserData;
export const setOrder = user.actions.setOrder;
export default user.reducer;

