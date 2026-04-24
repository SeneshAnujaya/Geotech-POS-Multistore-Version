import { createSlice } from "@reduxjs/toolkit";
import { showWarningToast, showSuccessToast } from "../../components/ToastNotification";

const initialState = {
    cartItems: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItemToCart: (state, action) => {
            const existingItem = state.cartItems.find((item) => item.sku === action.payload.sku);

            if(existingItem) {
                if(existingItem.cartQuantity < action.payload.quantity) {
                    existingItem.cartQuantity += 1;
                    showSuccessToast("Product Add to Cart");
                } else {
                    showWarningToast("Not Enough Stock");
                }
                
            } else {
                if(action.payload.quantity > 0) {
                    state.cartItems.push({...action.payload, cartQuantity: 1});
                    showSuccessToast("Product Add to Cart");
                } else {
                    showWarningToast("Not Enough Stock");
                }
                
            }
        },

        removeItemFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter((item) => item.sku !== action.payload.sku);
        },
        increaseItemQuantity: (state, action) => {
            const item = state.cartItems.find((item) => item.sku === action.payload.sku);
            if(item) {
                if(item.cartQuantity < item.quantity) {
                    item.cartQuantity += 1;
                } else {
                    showWarningToast("Not Enough Stock");
                }
              
            }
        },
        decreaseItemQuantity: (state, action) => {
            const item = state.cartItems.find((item) => item.sku === action.payload.sku);
            if(item && item.cartQuantity > 1) {
                item.cartQuantity -= 1;
            }
        },
        updateCartItemQuantity: (state, action) => {
            const item = state.cartItems.find((item) => item.sku === action.payload.sku);
            const newQuantity = action.payload.newQuantity;
            
            if(item) {
                if(newQuantity > 0 && newQuantity <= item.quantity) {
                    item.cartQuantity = newQuantity;
                 
                } else if (newQuantity > item.quantity) {
                    showWarningToast("Not Enough Stock");
                } else {
                    showWarningToast("Quantity must be at least 1");
                }
            }
        },
        updateWarrantyPeriod: (state, action) => {
            const {sku, warrantyPeriod} = action.payload;
            const item = state.cartItems.find((item) => item.sku === sku);
            if(item) {
                item.warrantyPeriod = warrantyPeriod;
            }
        },
        setCustomPrice: (state, action) => {
            const {sku, price} = action.payload;
            const item = state.cartItems.find((item) => item.sku === sku);
            if(item) {
                // item.customPrice = price !== null ? parseFloat(price) : null;
                item.customPrice = price;
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
        }
    }
});

export const {addItemToCart, removeItemFromCart, increaseItemQuantity, decreaseItemQuantity,  updateCartItemQuantity, updateWarrantyPeriod, setCustomPrice, clearCart } = cartSlice.actions;

export default cartSlice.reducer;     