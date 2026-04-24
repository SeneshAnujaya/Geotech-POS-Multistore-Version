import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import StoreSelect from "./StoreSelect";
import CustomSelect from "./CustomSelect";
import { useFetchProductsQuery } from "../redux/apiSlice";
import { showErrorToast } from "./ToastNotification";

const StockAddModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    productId: "",
    storeId: "",
    quantity: "",
  });

  const {
    data: products = { data: [] },
    error: productError,
    isLoading: isProductLoading,
  } = useFetchProductsQuery({});

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.productId || !formData.storeId || !formData.quantity) {
          showErrorToast("Please fill in all required fields.");
          return;
        }

    onCreate(formData);

    setFormData({
      productId: "",
      storeId: "",
      quantity: "",
    })
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductSelectChange = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productId,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-70 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border border-slate-600 w-96 shadow-lg rounded-md bg-blue-950">
        <h1 className="text-xl font-medium text-slate-300">
          Create New Stock
        </h1>
        <form onSubmit={handleSubmit} className="mt-5">

          {/* Product Select */}
          <label
            htmlFor="product"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Select Product
          </label>
          <div className={`mb-4 rounded-md ${formData.selectedproductId ? "border-4 border-green-500" : ""}`}>
            <CustomSelect
              options={[...(products.data || [])].sort((a, b) => a.name.localeCompare(b.name)).map((product) => ({ value: product.productId, label: product.name }))}
              placeholder="Select a product..."
              value={formData.productId || ""}
              onChange={handleProductSelectChange}
              fallBackValue="No product found"
              required
            />
          </div>

          {/* Store select */}
          <StoreSelect value={formData.storeId} onChange={(e) =>
            setFormData((prev) => ({ ...prev, storeId: e.target.value }))
          } />

          {/* Stock Quantity */}
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            placeholder="Product Quantity"
            value={formData.quantity}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleInputChange}
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

export default StockAddModal;
