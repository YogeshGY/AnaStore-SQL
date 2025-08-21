import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

const registerApi = "http://localhost:3000/register";
const loginAPI = "http://localhost:3000/login";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (credentials) => {
    const response = await axios.post(registerApi, credentials);
    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(loginAPI, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue("Network error or server not reachable");
      }
    }
  }
);

const authReducer = createSlice({
  name: "auth",
  initialState: {
    userDatas: [],
    loading: false,
    error: null,
    logedStatus: "user",
  },
  reducers: {
    logout: (state) => {
      state.userDatas = [];
      state.loading = false;
      state.error = null;
      state.logedStatus = "user";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userDatas = action.payload;
        state.logedStatus = action.payload.role;
        Cookies.set("jwtToken", action.payload.token, { expires: 1 });
        Cookies.set("userId", action.payload._id, { expires: 1 });
        Cookies.set("userRole", action.payload.role, { expires: 1 });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || "Login failed";
      });
  },
});

export default authReducer.reducer;
export const { logout } = authReducer.actions;
