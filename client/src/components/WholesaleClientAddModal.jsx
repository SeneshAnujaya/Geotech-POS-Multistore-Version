import React, { useState } from "react";
import { useFetchWholesaleClientsQuery } from "../redux/apiSlice";
import { showErrorToast } from "./ToastNotification";

const WholesaleClientAddModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.clientType) {
      showErrorToast("Please select a client type");
      return;
    }

    onCreate(formData);
    setFormData({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleClientTypeChange = (e) => {
    const clientType = e.target.value;
    setFormData({
      ...formData,
      clientType,
    });
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-70 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-6 border border-slate-600 w-96 shadow-lg rounded-md bg-blue-950">
        <h1 className="text-2xl font-semibold text-slate-300">
          Create New Client
        </h1>
        <form onSubmit={handleSubmit} className="mt-5">
          <>
            <label
              htmlFor="client-type"
              className="block text-sm font-medium text-gray-300"
            >
              Select Client Type
            </label>
            <select
              className="w-full p-2 rounded-md text-slate-800"
              onChange={handleClientTypeChange}
              name="clientType"
              value={formData.clientType}
              required
            >
              <option value="">Select a client Type...</option>
              <option value="REGULAR">Regular</option>
              <option value="BULK">Wholesale</option>
            </select>
          </>
          {/* ---------------------------------- */}
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300"
          >
            Name
          </label>
          <input
            type="text"
            name="clientName"
            placeholder="Name..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />
          <label
            htmlFor="phonenumber"
            className="block text-sm font-medium text-gray-300"
          >
            Phone Number
          </label>
          <input
            type="text"
            name="phonenumber"
            placeholder="Phone Number..."
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
          />

          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-gray-300"
          >
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            placeholder="Company Name..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
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

export default WholesaleClientAddModal;
