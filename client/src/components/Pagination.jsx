import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

const Pagination = ({ total, limit, currentPage, setPage, showing }) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex gap-4 justify-between">
      <p className="text-[0.9rem] text-slate-400">
        Showing {showing}/{total} results
      </p>
      <div className="flex gap-3">
        <button
          className=" py-1 px-2 pr-4 rounded-md border border-slate-600 hover:bg-blue-600 hover:border-blue-600 flex items-center text-[0.95rem] disabled:opacity-60"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <span>
            <ChevronLeft className="w-5 h-5" />
          </span>
          Prev
        </button>
        <span>page {+1} of total pages</span>
        <button
          className="p-2 py-1 px-2 pl-4 rounded-md border border-slate-600 hover:bg-blue-600 hover:border-blue-600 flex items-center text-[0.95rem]"
          onClick={() => {
            setPage(currentPage + 1);
          }}
          disabled={currentPage + 1 === totalPages}
        >
          Next
          <span>
            <ChevronRight className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
