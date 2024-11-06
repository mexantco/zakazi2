import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./reducers/user";
import chatsReducer from "./reducers/chats";
import clubsReducer from "./reducers/clubs";
import systemReducer from "./reducers/system";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const reducers = combineReducers({
  system: systemReducer,
  user: userReducer,
  chats: chatsReducer,
  clubs: clubsReducer,
});
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, reducers);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
});

export default store;
