import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import { useDispatch } from "react-redux";
import { checkSetupStatus } from "../redux/initialSetup/initialStatusSlice";
import { useFetchUsersQuery } from "../redux/apiSlice";

const apiUrl = import.meta.env.VITE_API_URL;

const SignUp = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { refetch } = useFetchUsersQuery(undefined, {});

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
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/initialsetup/signupAdmin`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = res.data;
      if (!data.success) {
        showErrorToast(data.message || "Error occurred");
        setLoading(false);
        return;
      }

      setLoading(false);
      dispatch(checkSetupStatus());
      refetch();
      navigate("/sign-in");
      showSuccessToast("Account created successfully!");
    } catch (error) {
      console.log(error);

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
      setLoading(false);
      // showErrorToast(error.response.data.error || "Server error");
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
          <div className="w-full max-w-md mx-auto  rounded-md border-slate-700 px-10 py-14 bg-[#002136] border">
            <h1 className="text-white text-3xl mb-6">GEOTECH</h1>
            <p className="mb-12 text-slate-300">
              Please Signup For create Admin Account
            </p>
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <label htmlFor="username" className="text-slate-300 mb-2 text-sm">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Name..."
                className="bg-[#002c47] border-slate-700 border text-slate-200 p-2 px-3 rounded-sm mb-4 focus-within:outline-none"
                onChange={handleChange}
              />
              <label htmlFor="email" className="text-slate-300 mb-2 text-sm">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email..."
                className="bg-[#002c47] border-slate-700 border text-slate-200 p-2 px-3 rounded-sm mb-4 focus-within:outline-none"
                onChange={handleChange}
              />
              <label htmlFor="password" className="text-slate-300 mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password.."
                className="bg-[#002c47] border-slate-700 border text-slate-200  p-2 rounded-sm mb-4 focus-within:outline-none px-3"
                onChange={handleChange}
              />
              <button
                disabled={loading}
                className="bg-[#005AD0] p-2 text-white rounded-md hover:bg-[#0163e2] mt-6 py-2 disabled:opacity-80"
              >
                {loading ? "Loading..." : " Sign Up "}
              </button>
            </form>
            <div className="flex gap-2 mt-6">
              <p className="text-slate-300">Have an account ? </p>
              <Link to={"/sign-in"}>
                <span className="text-blue-400">Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
