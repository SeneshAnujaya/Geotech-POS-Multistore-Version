import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const saleSlice = createSlice({
  name: 'sales',
  initialState: {
    sales: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setSales(state, action) {
      state.sales = action.payload;
      state.loading = false;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setSales, setError } = saleSlice.actions;
export default saleSlice.reducer;

export const fetchSales = () => async (dispatch) => {
    dispatch(setLoading());
    try {
      const response = await axios.get(`${apiUrl}/sales/getSales`);
      dispatch(setSales(response.data.data));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  


