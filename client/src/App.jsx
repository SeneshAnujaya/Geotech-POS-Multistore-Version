import { ThemeProvider, createTheme } from "@mui/material/styles";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ToastNotification from "./components/ToastNotification";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Category";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Sales from "./pages/Sales";
import Users from "./pages/Users";
import WholesaleClients from "./pages/WholesaleClients";
import DueSales from "./pages/DueSales";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { checkSetupStatus } from "./redux/initialSetup/initialStatusSlice";
import MoreClientInfo from "./pages/MoreClientInfo";
import ReturnCancelSales from "./pages/ReturnCancelSales";
import UserProfile from "./pages/UserProfile";
import Stores from "./pages/Stores";
import Stocks from "./pages/Stocks";
// import { useCheckSetupStatusQuery } from './redux/apiSlice';

const theme = createTheme({
  palette: {
    mode: "dark", // Set the theme to dark mode
  },
});

const App = () => {
  const dispatch = useDispatch();
  const { initialStatus } = useSelector((state) => state.initialStatus);
  const { currentUser } = useSelector((state) => state.user);
  const role = currentUser?.rest?.role; 
    

  const isSetupRequired = initialStatus?.setupRequired ?? null;

  useEffect(() => {
    dispatch(checkSetupStatus());
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ToastNotification />
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route
            path="/sign-up"
            element={!isSetupRequired ? <Navigate to="/sign-in" /> : <SignUp />}
          />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/categories" element={<Category />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/duesales" element={<DueSales />} />
            <Route path="/returncancelSales" element={<ReturnCancelSales />} />
            <Route path="/Wholesales" element={<WholesaleClients />} />
            <Route path="/users" element={<Users />} />
            <Route path="/moreclientinfo/:id" element={<MoreClientInfo />} />
            <Route path="/profile" element={<UserProfile />}/>
            <Route path="/stocks" element={<Stocks />}/>
            <Route path="/stores" element={role == 'ADMIN' ? <Stores /> : <Navigate to="/sign-in" />}/>
          </Route>
          <Route path="*" element={<Navigate to="/sign-in" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
