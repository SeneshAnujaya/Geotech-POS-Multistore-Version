import React from "react";
import { useFetchStoresQuery } from "../redux/apiSlice";

const StoreSelect = ({value, onChange}) => {
  const { data: stores, isLoading, isError } = useFetchStoresQuery();

  if (isLoading)
    return <p className="text-sm text-gray-400">Loading stores...</p>;
  if (isError)
    return <p className="text-sm text-red-400">Failed to load stores.</p>;

  return (
    <div>
      <label
        htmlFor="storeId"
        className="block text-sm font-medium text-gray-300"
      >
        Select Store
      </label>
      <select
        className="mt-1 block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
        name="storeId"
        value={value}
        onChange={onChange}
        required
      >
        <option value="">Select Store</option>

        {stores?.data?.map((store) => (
          <option key={store.storeId} value={store.storeId}>
            {store.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StoreSelect;
