import React, { useState } from "react";

import StoreSelect from "./StoreSelect";

const UserAddModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-70 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border border-slate-600 w-96 shadow-lg rounded-md bg-blue-950">
        <h1 className="text-2xl font-semibold text-slate-300">
          Create New User
        </h1>
        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="userName"
            className="block text-sm font-medium text-gray-300"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />
          {/* Store Select */}
          <StoreSelect value={formData.storeId} onChange={handleChange} />

          <button
            type="submit"
            className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-1 bg-red-700 text-white rounded hover:bg-red-800"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserAddModal;
