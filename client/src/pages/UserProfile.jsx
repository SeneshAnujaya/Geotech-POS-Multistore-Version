import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";

import { useSelector } from "react-redux";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import axios from "axios";
import {
  useFetchUsersQuery,
  useUpdateUserAccountMutation,
} from "../redux/apiSlice";

const Users = () => {
  const { currentUser } = useSelector((state) => state.user);
  const role = currentUser.rest.role;
  const userId = currentUser.rest.id;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const {
    data: users = { data: [] },
    error,
    isLoading,
    refetch,
  } = useFetchUsersQuery(undefined, {});

  const currentUserInfo =
    users?.data?.find((user) => user.id === userId) || null;

  const [updateUserAccount, { isLoading: isUpdating }] =
    useUpdateUserAccountMutation();

  useEffect(() => {
    if (currentUser) {
      setName(currentUserInfo?.name || "");
      setEmail(currentUserInfo?.email || "");
    }
  }, [currentUser, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedData = { id: userId, name, email, currentPassword, newPassword };

      const res = await updateUserAccount(updatedData).unwrap();
      if (res.success) {
        showSuccessToast(res.message);
      }
    } catch (error) {
      showErrorToast(error.data?.message || "Error updating user");
    }

    setName(currentUser.rest.name);
    setEmail(currentUser.rest.email);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleCancel = () => {
    setName(currentUser.rest.name);
    setEmail(currentUser.rest.email);
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <MainLayout>
      <div className="px-0 md:px-8 py-4 flex flex-col border border-slate-700 rounded-md min-h-[800px]">
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6 mt-2">
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
        </div>

        {/* Profile setting container */}
        <div className="w-full max-w-xl  border border-slate-700 rounded-md mt-6 px-8 py-14">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <label htmlFor="username" className="text-slate-300 mb-2 text-sm">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name..."
              className="bg-slate-800 border-slate-700 border text-slate-200 p-2 px-3 rounded-sm mb-4 focus-within:outline-none focus:border-blue-400"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
            <label htmlFor="email" className="text-slate-300 mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email..."
              className="bg-slate-800 border-slate-700 border text-slate-200 p-2 px-3 rounded-sm mb-4 focus-within:outline-none focus:border-blue-400"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />

            <label
              htmlFor="currentPassword"
              className="text-slate-300 mb-2 text-sm"
            >
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              placeholder="Current Password..."
              className="bg-slate-800 border-slate-700 border text-slate-200 p-2 px-3 rounded-sm mb-4 focus-within:outline-none focus:border-blue-400"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            {role === "ADMIN" && (
              <>
                <label
                  htmlFor="newPassword"
                  className="text-slate-300 mb-2 text-sm"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="New Password (optional)..."
                  className="bg-slate-800 border-slate-700 border text-slate-200 p-2 px-3 rounded-sm mb-4 focus-within:outline-none focus:border-blue-400"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </>
            )}

            <div className="flex gap-4 items-center">
              <button
                type="submit"
                className="bg-[#005AD0] p-2 text-white rounded-md hover:bg-[#0163e2] mt-6 px-4 py-2 disabled:opacity-80"
              >
                Save Changes
              </button>
              <button type="button"
                className="bg-transparent border border-slate-600 p-2 text-white rounded-md hover:bg-red-700 hover:border-red-700 mt-6 px-4 py-2 disabled:opacity-80"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
