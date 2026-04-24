import { createSlice} from "@reduxjs/toolkit";

const initialState = {
    isSidebarCollapsed: false,
    isDarkMode: false,
};

const uisettingSlice = createSlice({
    name: "uisetting",
    initialState,
    reducers: {
        setIsSidebarCollapsed: (state, action) => {
            state.isSidebarCollapsed = action.payload;
        },
        setIsDarkMode: (state, action) => {
            state.isDarkMode = action.payload;
        },
       
    }
});

export const { setIsSidebarCollapsed, setIsDarkMode} = uisettingSlice.actions;
export default uisettingSlice.reducer;
