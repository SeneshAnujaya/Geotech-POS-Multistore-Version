import { Search } from "lucide-react";
import React from "react";

const SearchBar = ({setSearchTerm, placeholder}) => {
  return (
    <div className="relative">
      <input
        type="search"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 w-50 md:w-96 border border-slate-600 bg-slate-800 rounded-lg focus:outline-none focus:border-blue-500 text-[0.95rem] sm:text-base"
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      />
      <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex  pointer-events-none">
        <Search className="text-gray-500" size={20} />
      </div>
    </div>
  );
};

export default SearchBar;
