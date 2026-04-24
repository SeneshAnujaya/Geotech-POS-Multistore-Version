import React, { useEffect, useState } from "react";
import { showErrorToast } from "./ToastNotification";

const DuePayModal = ({ isOpen, onClose, outstandingBalance, onCreate }) => {
  const [formData, setFormData] = useState({
    payAmount: "",
  });
  const [remainBalance, setRemainBalance] = useState(outstandingBalance);

  useEffect(() => {
    const payAmount = parseFloat(formData.payAmount) || 0;

    if(payAmount < 0) {
      setRemainBalance(outstandingBalance)
    } else if (payAmount > outstandingBalance) {
      setRemainBalance(0);
    }

    else {
      setRemainBalance(outstandingBalance - payAmount)
    }
    
  },[outstandingBalance, formData.payAmount])



  const handleSubmit = (e) => {
    e.preventDefault();

    const amountToPay = parseFloat(formData.payAmount);

    if (!formData.payAmount) {
      showErrorToast("Paid amount cannot be empty.");
      return;
    }

    // Check if the parsed amount is valid
    if (isNaN(amountToPay)) {
      showErrorToast("Paid amount must be a number.");
      return;
    }

    if (amountToPay > outstandingBalance) {
      showErrorToast("Paid amount exceeds remaining balance.");
      return;
    }

    if (amountToPay === 0) {
      showErrorToast("Paid amount should be more than zero.");
      return;
    }
 

    onCreate(amountToPay);
    onClose();
    setFormData({ payAmount: "" });
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
      <div className="relative top-20 mx-auto p-6 border border-slate-600 w-96 shadow-lg rounded-md bg-blue-950">
        <h1 className="text-2xl font-medium text-slate-300">
          Make a payment
        </h1>
        <div className="mt-6 text-[1rem] leading-6">
    
          <p className="text-slate-200 text-[1.01rem]">Outstanding Balance : {outstandingBalance} </p>
          <p className="text-slate-200 text-[1.01rem] mt-1">Remaining Balance :  {remainBalance} </p>
        </div>
        <form onSubmit={handleSubmit}  className="mt-3">
          <label
            htmlFor="payAmount"
            className="block text-sm font-medium text-gray-300"
          >
           Amount to Pay
          </label>
          <input
            type="number"
            name="payAmount"
            placeholder="Pay Amount..."
            value={formData.value}
            className="block w-full mt-1 mb-2 p-2 border-gray-600 border rounded-md text-gray-900 focus:outline-none"
            onChange={handleChange}
            required
            min={0}
          />

          <button
            type="submit"
            className="mt-6 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Pay Now
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

export default DuePayModal;
