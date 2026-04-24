import { useState } from "react";

const LogoutConfirm = ({ isOpen, onClose, logOut }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-70 overflow-y-auto h-full w-full z-20">
      <div className="relative top-40 mx-auto p-5 border border-slate-600 w-96 shadow-lg rounded-md bg-blue-950">
        <h2 className="text-xl font-semibold text-slate-300">Confirm Logout</h2>
        <p className="mt-2">Are you sure you want to logout ?</p>
        <div className="mt-10 flex gap-6 items-center">
          <button
            className="border border-green-700 py-1.5 px-3 rounded-md bg-green-700"
            onClick={logOut}
          >
            Logout
          </button>
          <button
            className="border border-red-700 py-1.5 px-3 rounded-md bg-red-700"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
