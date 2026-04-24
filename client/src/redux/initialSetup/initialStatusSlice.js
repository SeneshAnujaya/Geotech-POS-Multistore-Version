import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const initialStatusSlice = createSlice({
  name: 'initialStatus',
  initialState: {
    initialStatus: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setInitialState(state, action) {
      state.initialStatus = action.payload;
      state.loading = false;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setInitialState, setError } = initialStatusSlice.actions;
export default initialStatusSlice.reducer;

export const checkSetupStatus = () => async (dispatch) => {
    dispatch(setLoading());
    try {
      const response = await axios.get(`${apiUrl}/initialsetup/check-setup`);
      dispatch(setInitialState(response.data));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };


