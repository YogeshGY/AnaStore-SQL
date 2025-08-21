import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

const orderApi = "http://localhost:3000/orders";

const getUserId = () => Cookies.get("userId");

export const getorderItems = createAsyncThunk(
  "yourOrder/getorderItems",
  async () => {
    const userId = getUserId();
    if (!userId) return [];
    const response = await axios.get(`${orderApi}/user/${userId}`);
    return response.data?.orders || [];
  }
);

export const orderHistory = createAsyncThunk(
  "yourOrder/orderHistory",
  async (orderItems) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");
    const response = await axios.post(`${orderApi}/${userId}`, orderItems);
    return response.data?.orders || [];
  }
);

const yourOrderSlice = createSlice({
  name: "yourOrders",
  initialState: {
    orderedItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getorderItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(getorderItems.fulfilled, (state, action) => {
        state.orderedItems = action.payload;
        state.loading = false;
      })
      .addCase(getorderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(orderHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(orderHistory.fulfilled, (state, action) => {
        state.orderedItems = action.payload;
        state.loading = false;
      })
      .addCase(orderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default yourOrderSlice.reducer;
