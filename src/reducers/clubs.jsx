import { createSlice } from "@reduxjs/toolkit";

const clubs = createSlice({
  name: "clubs",
  initialState: {clubs:[]},
  reducers: {
    setClubs: (state, action) => {
      state.clubs = action.payload.clubs;
      
    },
    setClubData: (state, action) => {
      state.clubData = action.payload.clubData;
      
    },
  },
});


export const setClubs = clubs.actions.setClubs;
export const setClubData = clubs.actions.setClubData;
export default clubs.reducer;
