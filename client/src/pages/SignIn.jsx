import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

const apiUrl = import.meta.env.VITE_API_URL;

const SignIn = () => {
  const [formData, setFormData] = useState({});
  const { loading } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
    try {
      const res = await axios.post(`${apiUrl}/auth/signin`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = res.data;
      if (!data.success) {
        showErrorToast(data.message || "Error occurred");
        dispatch(signInFailure(data.message));
        return;
      }

      dispatch(signInSuccess(data));
      navigate("/");
      showSuccessToast("Login successfully!");
    } catch (error) {
      if (error.response) {
        // Handle server-side errors
        showErrorToast(error.response.data.message || "Server error");
      } else if (error.request) {
        // Handle network errors
        showErrorToast("Network error, please try again");
      } else {
        // Handle other errors
        showErrorToast("An unexpected error occurred");
      }
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="bg-[#001A2C] h-screen ">
      <div className="max-w-screen-xl mx-auto flex flex-1 h-screen items-center justify-center">
        {/* <div className='w-1/2  flex flex-col items-center justify-center'>
        <img src={logo} width={320} alt='site-logo' className='rounded-lg'/>
        <p className='text-white font-light text-xl mt-6'>Welcome to geotech pos system</p>
      </div> */}
        <div className="p-4 w-full ">
          <div className="w-full max-w-md mx-auto  rounded-md border-slate-700 px-10 py-16 bg-[#002136] border">
            <h1 className="text-white text-3xl mb-6">GEOTECH</h1>
            <p className="mb-12 text-slate-200">
              Welcome to Geotech POS System. please login as a Admin or User
            </p>
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <label htmlFor="email" className="text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email..."
                className="bg-[#002c47] border-slate-700 border text-slate-200 p-2 rounded-sm mb-4 focus-within:outline-none"
                onChange={handleChange}
              />
              <label htmlFor="password" className="text-slate-300 mb-2">
                password
              </label>
              <input
                type="password"
                id="password"
                placeholder="password.."
                className="bg-[#002c47] border-slate-700 border text-slate-200  p-2 rounded-sm mb-4 focus-within:outline-none"
                onChange={handleChange}
              />
              <button
                disabled={loading}
                className="bg-[#005AD0] p-2 text-white rounded-md hover:bg-[#0163e2] mt-8 py-2 disabled:opacity-80"
              >
                {loading ? "Loading..." : " Login "}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
