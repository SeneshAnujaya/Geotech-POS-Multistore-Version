import React, { useEffect, useState } from "react";
import { showErrorToast } from "./ToastNotification";
import { useSelector } from "react-redux";

const CancelReturnModal = ({
  isOpen,
  onClose,
  onCreate,
  saleId,
  saleItems,
}) => {
  const [formData, setFormData] = useState({});
  const [isHalfReturn, setIsHalfReturn] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState({});

   const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  const resetStates = () => {
    setFormData({});
    setReturnQuantities({});
    setIsHalfReturn(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetStates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (saleItems?.length > 0) {
      const initialQuantities = {};
      saleItems.forEach((item) => {
        initialQuantities[item.sku] = 0;
      });
      setReturnQuantities(initialQuantities);
    }
  }, [saleItems]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate return quantities
    for (const item of saleItems) {
      if (returnQuantities[item.sku] > item.cartQuantity) {
        showErrorToast(`Return quantity cannot be greater than Sold quantity`);
        return;
      }
    }

    if (formData.saleStatus === "half_return") {
      const totalReturnQty = Object.values(returnQuantities).reduce(
        (sum, qty) => sum + qty,
        0
      );

      if (totalReturnQty === 0) {
        showErrorToast("At least one item should be returned.");
        return;
      }
    }

    onCreate({ ...formData, returnQty: returnQuantities, storeId: selectedStoreId });
    resetStates();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      saleId: saleId,
      // returnQty: returnQuantities,
    });

    if (value !== "half_return") {
      const resetQuantities = {};
      saleItems.forEach((item) => {
        resetQuantities[item.sku] = 0;
      });
      setReturnQuantities(resetQuantities);
    }

    setIsHalfReturn(value === "half_return");
  };

  const handleQuantityChange = (sku, value) => {
    const returnQty = value === "" ? 0 : Math.max(Number(value), 0);

    setReturnQuantities((prevQuantities) => ({
      ...prevQuantities,
      [sku]: returnQty,
    }));
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-70 overflow-y-auto h-full w-full z-20">
      <div className="relative top-36 mx-auto p-5 border border-slate-600 max-w-[600px] shadow-lg rounded-md bg-blue-950">
        <h1 className="text-2xl font-semibold text-slate-300">
          Cancel or Return Sale
        </h1>
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="flex flex-col mb-2">
            <label
              htmlFor="saleStatus"
              className="block text-[0.95rem] mb-1 font-medium text-gray-300"
            >
              Sale Status
            </label>

            <select
              className="block w-full p-2 border-gray-600 bg-slate-200 border rounded-md text-gray-900"
              name="saleStatus"
              onChange={handleChange}
              required
            >
              <option value="">Select sale status...</option>
              <option value="cancel">Cancel</option>
              <option value="full_return">Full Return</option>
              <option value="half_return">Half Return</option>
            </select>
          </div>

          {isHalfReturn && (
            <div className="mt-4">
              <h2 className="text-[0.95rem] font-medium text-gray-300">
                Select Items to Return
              </h2>
              <table className="w-full text-left text-gray-300 mt-4">
                <thead>
                  <tr>
                    <th className="border-b font-medium border-gray-500 px-2 py-1">
                      SKU
                    </th>
                    <th className="border-b font-medium border-gray-500 px-2 py-1">
                      Name
                    </th>
                    <th className="border-b font-medium border-gray-500 px-2 py-1">
                      Sold
                    </th>
                    <th className="border-b font-medium border-gray-500 px-2 py-1">
                      Price
                    </th>
                    <th className="border-b font-medium border-gray-500 px-2 py-1">
                      Return Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((item) => (
                    <tr key={item.sku}>
                      <td className="px-2 py-2">{item.sku}</td>
                      <td className="px-2 py-2">{item.name}</td>
                      <td className="px-2 py-2">{item.cartQuantity}</td>
                      <td className="px-2 py-2">{item.price}</td>

                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          // max={item.cartQuantity}
                          onChange={(e) =>
                            handleQuantityChange(item.sku, e.target.value)
                          }
                          value={returnQuantities[item.sku] || 0}
                          className="w-12 p-1 border border-gray-400 rounded bg-blue-900"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="submit"
            className="mt-6 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit
          </button>
          <button
            onClick={() => {
              resetStates();
              onClose();
            }}
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

export default CancelReturnModal;
