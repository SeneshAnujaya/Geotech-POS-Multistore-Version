import { useState } from "react";
import StoreSelect from "./StoreSelect";
import { showErrorToast } from "./ToastNotification";

const RepairAddModal = ({
  isOpen,
  onClose,
  onCreate,
  technicians = [],
}) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",

    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",

    problemDescription: "",

    storeId: "",
    assignedUserId: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",

      deviceType: "",
      brand: "",
      model: "",
      serialNumber: "",

      problemDescription: "",

      storeId: "",
      assignedUserId: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.deviceType ||
      !formData.problemDescription ||
      !formData.storeId
    ) {
      showErrorToast("Please fill in all required fields.");
      return;
    }

    onCreate(formData);

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto z-50">
      <div className="relative top-20 mx-auto p-5 border border-slate-700 w-[800px] shadow-xl rounded-lg bg-slate-950">
        <h2 className="text-[1.4rem] font-medium text-slate-200 mb-5">
          Create Repair Job
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-light text-slate-300 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Customer Name"
                className="w-full p-2 rounded border !border-slate-800 text-white-200 bg-slate-900 font-light focus:border-blue-600"
                required
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block text-sm font-light text-slate-300 mb-1">
                Customer Phone *
              </label>
              <input
                type="text"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="0771234567"
                className="w-full p-2 rounded border border-slate-600 bg-gray-800 font-light text-white-200"
                required
              />
            </div>

            {/* Device Type */}
            <div>
              <label className="block text-sm font-light text-slate-300 mb-1">
                Device Type *
              </label>

              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleInputChange}
                className="w-full p-2 rounded border border-slate-600 bg-gray-800 font-light text-white-200"
                required
              >
                <option value="">Select Device Type</option>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Printer">Printer</option>
                <option value="Monitor">Monitor</option>
                <option value="UPS">UPS</option>
                <option value="Router">Router</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-light text-slate-300 mb-1">
                Brand
              </label>

              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Dell"
                className="w-full p-2 rounded border border-slate-600 bg-gray-800 text-gray-900"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-light text-slate-300 mb-1">
                Model
              </label>

              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Inspiron 15"
                className="w-full p-2 rounded border border-slate-600 bg-gray-800 text-gray-900"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-light text-slate-300 mb-1">
                Serial Number
              </label>

              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="ABC123XYZ"
                className="w-full p-2 rounded border border-slate-600 bg-gray-800 text-gray-900"
              />
            </div>

            {/* Store */}
            <div>
              <label className="block text-sm font-light text-slate-300 mb-1">
                Store *
              </label>

              <StoreSelect
                value={formData.storeId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    storeId: e.target.value,
                  }))
                }
              />
            </div>

            {/* Technician */}
            <div>
              <label className="block text-sm font-light bg-gray-800 text-slate-300 mb-1">
                Assign Technician
              </label>

              <select
                name="assignedUserId"
                value={formData.assignedUserId}
                onChange={handleInputChange}
                className="w-full p-2 rounded border border-slate-600 text-gray-900"
              >
                <option value="">Select Technician</option>

                {technicians.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Problem Description */}
          <div className="mt-4">
            <label className="block text-sm font-light text-slate-300 mb-1">
              Problem Description *
            </label>

            <textarea
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleInputChange}
              rows={5}
              placeholder="Describe the issue..."
              className="w-full p-2 rounded border border-slate-600 bg-gray-800 text-gray-900"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Repair Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairAddModal;