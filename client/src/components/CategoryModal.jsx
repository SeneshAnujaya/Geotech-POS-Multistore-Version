import { useState } from "react";

const CategoryModal = ({ isOpen, onClose, onCreate, percentage }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "categoryPic") {
      setFormData({
        ...formData,
        categoryPic: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-70 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border border-slate-600 w-96 shadow-lg rounded-md bg-blue-950">
        <h1 className="text-2xl font-semibold text-slate-300">
          Create New Category
        </h1>
        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="categoryName"
            className="block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <input
            type="text"
            name="name"
            placeholder="Category Name..."
            value={formData.value}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
            required
          />
          <label
            htmlFor="categoryPic"
            className="block text-sm font-medium text-gray-300"
          >
            Category Image
          </label>
          <input
            type="file"
            name="categoryPic"
            accept="image/*"
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-white"
            onChange={handleChange}
          />
          {percentage > !0 && (
            <div className="w-full bg-[f3f3f3] my-3">
              <div>Uploading image {percentage}%</div>
            </div>
          )}
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

export default CategoryModal;
