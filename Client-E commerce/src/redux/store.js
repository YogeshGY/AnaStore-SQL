import { configureStore } from "@reduxjs/toolkit";
import productSlice from "./productSlice";
import cartSlice from "./cartSlice";
import authReducer from "./auth";
import yourOrderSlice from "./yourOrderSlice";

const store = configureStore({
  devTools: true,
  reducer: {
    product: productSlice,
    cart: cartSlice,
    auth: authReducer,
    yourOrders: yourOrderSlice,
  },
});

export default store;
