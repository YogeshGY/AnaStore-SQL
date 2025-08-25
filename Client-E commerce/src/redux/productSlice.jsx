import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const productApi = "http://localhost:3000/products";
const addProductApi = "http://localhost:3000/addProduct";
const deleteProductApi = "http://localhost:3000/deleteproduct";
const updateProductApi = "http://localhost:3000/updateproduct";
const searchApi = "http://localhost:3000/searchProductApi";
const getCategoryApi = "http://localhost:3000/searchProductCategory";
const searchProductbyCategory = "http://localhost:3000/searchProductbyCategory";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async () => {
    const response = await axios.get(productApi);
    return response.data;
  }
);

export const addProductAdmin = createAsyncThunk(
  "product/addProductAdmin",
  async (newProduct, { rejectWithValue }) => {
    try {
      const response = await axios.post(addProductApi, newProduct);
      const productId = response.data.productId;
      const { data } = await axios.get(`${productApi}/${productId}`);
      return data.product;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue("Network error or server not reachable");
      }
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ _id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${updateProductApi}/${_id}`,
        updatedData
      );
      return response.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (_id) => {
    await axios.delete(`${deleteProductApi}/${_id}`);
    return _id;
  }
);

export const getCategory = createAsyncThunk(
  "product/getCategoryApi",
  async () => {
    const response = await axios.get(getCategoryApi);
    return response.data.categories;
  }
);

export const searchProduct = createAsyncThunk(
  "product/searchProduct",
  async ({ searchTerm }) => {
    const response = await axios.get(`${searchApi}/${searchTerm}`);
    return response.data.product;
  }
);

export const categorySearchProduct = createAsyncThunk(
  "product/searchProductbyCategory",
  async ({ category }) => {
    const response = await axios.get(`${searchProductbyCategory}/${category}`);
    return response.data.product;
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    items: [],
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.product;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(addProductAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductAdmin.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items.push(action.payload);
        }
      })
      .addCase(addProductAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((p) =>
            p._id === updated._id ? updated : p
          );
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(searchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(searchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = ["All", ...action.payload] || [];
      })
      .addCase(getCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(categorySearchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(categorySearchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(categorySearchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
  
});

export default productSlice.reducer;
