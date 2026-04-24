import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, SearchIcon } from "lucide-react";

export default function CustomSelect({ options, value, onChange, placeholder, fallBackValue = "No client found" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  // const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

    const selectedOption = options.find((opt) => opt.value === value) || null;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
    // setSelected(option);
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input */}
      <div
        className="flex justify-between items-center py-3 px-2 rounded cursor-pointer bg-white text-gray-800 text-sm"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedOption ? selectedOption.label : <span className="text-gray-500">{placeholder}</span>}
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 border rounded shadow bg-white w-full z-10">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            className="w-full p-2 border-b outline-none placeholder-gray-800 text-gray-800"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 && (
              <div className="p-2 text-gray-800 text-sm">{fallBackValue}</div>
            )}
            {filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className="p-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm"
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
