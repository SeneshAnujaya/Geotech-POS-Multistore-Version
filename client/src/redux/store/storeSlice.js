import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedStoreId: null,
}

const storeSlice = createSlice({
    name: "store",
    initialState,
    reducers: {
        setSelectedStoreId: (state, action) => {
            state.selectedStoreId = action.payload;
        },
        clearSelectedStoreId: (state) => {
            state.selectedStoreId = null;
        },
    },
});

export const { setSelectedStoreId, clearSelectedStoreId } = storeSlice.actions;
export default storeSlice.reducer;