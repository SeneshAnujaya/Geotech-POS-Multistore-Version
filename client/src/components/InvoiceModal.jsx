import { useState } from "react";

const InvoiceModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-70 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border border-slate-600 w-96 shadow-lg rounded-md bg-blue-950">
        <h1 className="text-2xl font-semibold text-slate-300">Invoice</h1>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default InvoiceModal;
