import React, { useState } from "react";


const StoreAddModal = ({ isOpen, onClose, onCreate }) => {
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
          Create New Store
        </h1>
        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="storeName"
            className="block text-sm font-medium text-gray-300"
          >
            Store Name
          </label>
          <input
            type="text"
            name="storeName"
            placeholder="Store Name..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-300"
          >
            Address
          </label>
          <input
            type="text"
            name="address"
            placeholder="Store Address..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-300"
          >
            Phone Number
          </label>
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />

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

export default StoreAddModal;
