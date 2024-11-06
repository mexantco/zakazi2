import { createSlice } from "@reduxjs/toolkit";
const user = createSlice({
    name: "push",
    initialState: {},
    reducers: {
      setPush: (state, action) => {
        state.push = action.payload.data;
        
      },
     
      },
     
    }
  );
export const setPush = user.actions.setPush;
export default user.reducer;