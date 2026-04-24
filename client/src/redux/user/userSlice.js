import { createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../../components/ToastNotification";

const initialState = {
    currentUser: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        signInFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signOut: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        }
    }
});

export const { signInStart, signInSuccess, signInFailure, signOut} = userSlice.actions;
export default userSlice.reducer;

