import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from './user/userSlice';
import uiSettingReducer from "./uiSetting/uiSettingsSlice";
import categoryReducer from './categories/categorySlice';
import productsReducer from './products/productsSlice';
import cartReducer from './cart/cartSlice';
import salesReducer from './sales/saleSlice';
import wholesaleClientReducer from './wholesaleclients/wholesaleclientSlice';
import initialStatusReducer from './initialSetup/initialStatusSlice';
import storeReducer from './store/storeSlice';

import {persistReducer, persistStore} from 'redux-persist';
import storage from "redux-persist/lib/storage";
import apiSlice from './apiSlice';


const rootReducer = combineReducers({user: userReducer, uisetting: uiSettingReducer, categories: categoryReducer, products: productsReducer, cart: cartReducer, sales: salesReducer, wholesaleClients: wholesaleClientReducer, initialStatus: initialStatusReducer, store: storeReducer,  [apiSlice.reducerPath]: apiSlice.reducer });

const persistConfig = {
    key: 'root',
    storage,
    version: 1,
    blacklist: [apiSlice.reducerPath],
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);
