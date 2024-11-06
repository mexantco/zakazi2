import { createSlice } from "@reduxjs/toolkit";

const system = createSlice({
  name: "system",
  initialState: {},
  reducers: {
    setSystem: (state, action) => {
      state.system = action.payload;
      
    },
   
    },
   
  }
);

export const setSystem = system.actions.setSystem;
export default system.reducer;

