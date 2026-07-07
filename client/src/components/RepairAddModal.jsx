import { useState } from "react";
import StoreSelect from "./StoreSelect";
import { showErrorToast } from "./ToastNotification";
import { Save, X } from 'lucide-react'

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
    technician: "",

    problemDescription: "",
    receivedItems: "",
    physicalCondition: "",

    estimatedCost: "",
    expectedDeliveryDate: "",


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
      technician: "",

      problemDescription: "",
      receivedItems: "",
      physicalCondition: "",

      estimatedCost: "",
      expectedDeliveryDate: "",


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
      !formData.brand ||
      !formData.model ||
      !formData.technician ||
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

  const labelStyle = "block text-[0.8rem] font-light text-slate-200 mb-1";
  const inputStyle = "w-full p-2 rounded border border-slate-800 text-white bg-slate-900 font-light focus:border-blue-400 focus:outline-none focus:ring-0 placeholder:text-sm";

  return (
    <div className="fixed inset-0 bg-black/70 overflow-y-auto z-50">
      <div className="relative top-20 mx-auto mb-20 p-5 border border-slate-700 w-[800px] shadow-xl rounded-lg bg-slate-950">
        <h2 className="text-[1.4rem] font-medium text-slate-200 mb-5">
          Create Repair Job
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">

            {/* Customer Name */}
            <div>
              <label className={labelStyle}>
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Customer Name"
                className={inputStyle}
                required
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className={labelStyle}>
                Customer Phone *
              </label>
              <input
                type="text"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className={inputStyle}
                required
              />
            </div>

            {/* Device Type */}
            <div>
              <label className={labelStyle}>
                Device Type *
              </label>

              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleInputChange}
                className={inputStyle}
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
              <label className={labelStyle}>
                Brand *
              </label>

              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Brand"
                className={inputStyle}
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className={labelStyle}>
                Model *
              </label>

              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Model"
                className={inputStyle}
                required
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className={labelStyle}>
                Serial Number
              </label>

              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="Serial Number"
                className={inputStyle}
              />
            </div>

            {/* Technician */}
            <div>
              <label className={labelStyle}>
                Technician *
              </label>

              <input
                type="text"
                name="technician"
                value={formData.technician}
                onChange={handleInputChange}
                placeholder="Technician"
                className={inputStyle}
                required
              />
            </div>

            {/* Estimated Cost */}
            <div>
              <label className={labelStyle}>
                Estimated Cost
              </label>

              <input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleInputChange}
                placeholder="Estimated Cost"
                className={inputStyle}
              />
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className={labelStyle}>
                Expected Delivery Date
              </label>

              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleInputChange}
                placeholder="Expected Delivery Date"
                className={inputStyle}
              />
            </div>

            {/* Store */}
            <div>
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

          </div>

          {/* Problem Description */}
          <div className="mt-4">
            <label className={labelStyle}>
              Problem Description *
            </label>

            <textarea
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleInputChange}
              rows={5}
              placeholder="Describe the issue..."
              className={inputStyle}
              required
            />
          </div>

          {/* Received Items */}
          <div className="mt-4">
            <label className={labelStyle}>
              Received Items
            </label>

            <textarea
              name="receivedItems"
              value={formData.receivedItems}
              onChange={handleInputChange}
              rows={5}
              placeholder="Received Items..."
              className={inputStyle}
              required
            />
          </div>

          {/* Physical Condition */}
          <div className="mt-4">
            <label className={labelStyle}>
              Physical Condition
            </label>

            <textarea
              name="physicalCondition"
              value={formData.physicalCondition}
              onChange={handleInputChange}
              rows={5}
              placeholder="Physical Condition..."
              className={inputStyle}
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
              className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm font-base rounded-md hover:bg-red-800 transition-colors duration-200"
            >
              <X size={18} />
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-base rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              <Save size={18} />
              Create Repair Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairAddModal;