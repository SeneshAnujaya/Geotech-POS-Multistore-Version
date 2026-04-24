import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../redux/categories/categorySlice";
import { useEffect, useState } from "react";
import StoreSelect from "./StoreSelect";

const ProductAddModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({});

  const { categories } = useSelector((state) => state.categories);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

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
        <h1 className="text-xl font-semibold text-slate-300">
          Create New Product
        </h1>
        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="ProductName"
            className="block text-sm font-medium text-gray-300"
          >
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            placeholder="Product Name..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />

          <label
            htmlFor="sku"
            className="block text-sm font-medium text-gray-300"
          >
            SKU Number
          </label>
          <input
            type="text"
            name="sku"
            placeholder="SKU Number"
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />

          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="block text-sm font-medium text-gray-600 w-full py-2 rounded-md"
          >
            <option value="">Select a category</option>
            {categories.map((category, index) => (
              <option
                className="text-gray-700"
                key={index}
                value={category.categoryId}
              >
                {category.name}
              </option>
            ))}
          </select>

          <label
            htmlFor="costPrice"
            className="block text-sm font-medium text-gray-300"
          >
            Cost Price
          </label>
          <input
            type="Number"
            step="0.01"
            min="0"
            name="costPrice"
            placeholder="Cost Price..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />

          <label
            htmlFor="wholesalePrice"
            className="block text-sm font-medium text-gray-300"
          >
            Wholesale Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="wholesalePrice"
            placeholder="Wholesale Price..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />

          <label
            htmlFor="retailPrice"
            className="block text-sm font-medium text-gray-300"
          >
            Retail Price
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="retailPrice"
            placeholder="Retail Price..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />

          {/* <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-300"
          >
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            placeholder="Product Quantity"
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          /> */}

          <label
            htmlFor="brand"
            className="block text-sm font-medium text-gray-300"
          >
            Brand
          </label>
          <input
            type="text"
            name="brand"
            placeholder="Product Brand..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />

          <label
            htmlFor="warranty"
            className="block text-sm font-medium text-gray-300"
          >
            Warranty Period
          </label>
          <input
            type="text"
            name="warranty"
            placeholder="Warranty period..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />
          {/* Store select */}
          {/* <StoreSelect value={formData.value} onChange={handleChange} /> */}
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

export default ProductAddModal;
