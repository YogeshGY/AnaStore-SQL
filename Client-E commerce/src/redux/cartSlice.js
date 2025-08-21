import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { logout } from "./auth";

const userCartApi = "http://localhost:3000/user";
const addToCartItems = "http://localhost:3000/addCartItemInUserDetails";
const removeCartApi = "http://localhost:3000/EmptyUserCart";

const getUserId = () => Cookies.get("userId");

export const getCartItems = createAsyncThunk("cart/getCartItems", async () => {
  const userId = getUserId();
  if (!userId) {
    return { user: { userDatas: { cartList: [] } } };
  }
  const response = await axios.get(`${userCartApi}/${userId}`);
  return response.data;
});

export const addItemCart = createAsyncThunk(
  "cart/addItemCart",
  async (cartItem) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User not logged in");
    }
    const response = await axios.put(`${addToCartItems}/${userId}`, cartItem);
    return response.data;
  }
);

export const removeItemCart = createAsyncThunk(
  "cart/removeItemCart",
  async (_id) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User not logged in");
    }
    const response = await axios.delete(
      `http://localhost:3000/removeCartItem/${userId}/cart/${_id}`
    );
    return response.data;
  }
);

export const quantityUpdation = createAsyncThunk(
  "cart/quantityUpdation",
  async ({ _id, quantity }) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error("User not logged in");
    }
    const response = await axios.put(
      `http://localhost:3000/updateQuantityInCart/${userId}/${_id}/${quantity}`
    );
    return response.data;
  }
);

export const emptyCart = createAsyncThunk("cart/emptyCart", async () => {
  const userId = getUserId();
  if (!userId) {
    return { user: { userDatas: { cartList: [] } } };
  }
  const response = await axios.delete(`${removeCartApi}/${userId}`);
  return response.data;
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    userDatas: [],
    items: [],
    loading: false,
    error: null,
    status: "idle",
  },
  reducers: {
    setUserDatas: (state, action) => {
      state.userDatas = action.payload;
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find((item) => item._id === action.payload);
      if (item) item.quantity += 1;
    },
    decrementQuantity: (state, action) => {
      const index = state.items.findIndex(
        (item) => item._id === action.payload
      );
      if (index !== -1) {
        if (state.items[index].quantity > 1) {
          state.items[index].quantity -= 1;
        } else {
          state.items.splice(index, 1);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCartItems.fulfilled, (state, action) => {
        state.items = action.payload?.user?.userDatas?.cartList || [];
        state.loading = false;
      })
      .addCase(addItemCart.fulfilled, (state, action) => {
        state.items = action.payload?.user?.userDatas?.cartList || state.items;
        state.loading = false;
      })
      .addCase(removeItemCart.fulfilled, (state, action) => {
        state.items = action.payload?.user?.userDatas?.cartList || state.items;
        state.loading = false;
      })
      .addCase(emptyCart.fulfilled, (state, action) => {
        state.items = action.payload?.user?.userDatas?.cartList || [];
        state.loading = false;
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.userDatas = [];
        state.loading = false;
        state.error = null;
      })
      .addCase(quantityUpdation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(quantityUpdation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload?.user?.userDatas?.cartList || state.items;
      })
      .addCase(quantityUpdation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setUserDatas, incrementQuantity, decrementQuantity } =
  cartSlice.actions;
export default cartSlice.reducer;
