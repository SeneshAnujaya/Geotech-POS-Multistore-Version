import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setCategories(state, action) {
      state.categories = action.payload;
      state.loading = false;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setCategories, setError } = categorySlice.actions;
export default categorySlice.reducer;

export const fetchCategories = () => async (dispatch) => {
    dispatch(setLoading());
    try {
      const response = await axios.get(`${apiUrl}/category/getCategories`);
      dispatch(setCategories(response.data.data));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };


