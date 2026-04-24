import { Trash2Icon } from "lucide-react";
import { useState } from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
 
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-70 overflow-y-auto h-full w-full z-20 ">
      <div className="relative top-80 mx-auto p-6 border border-slate-600 w-96 shadow-lg rounded-md bg-blue-950">
        <div className="flex items-center gap-3">
          <span className="border block w-fit p-2.5 border-slate-700 rounded-full  bg-blue-900 h-fit">
            <Trash2Icon className="w-6 h-6 text-blue-200" />
          </span>
          <h2 className="text-xl font-semibold text-slate-200">
            Confirm Delete
          </h2>
        </div>
        <p className="mt-4 text-slate-300 text-[0.95rem]">Are you sure you want to delete this item ?</p>
        <div className="mt-10 flex gap-4 items-center">
          <button
            className="border flex-1 border-red-800 py-1.5 px-3 rounded-md bg-red-800 font-medium hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            className="border flex-1 border-slate-500 py-1.5 px-3 rounded-md bg-transparent font-medium hover:bg-blue-500 hover:border-blue-500"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
