import { Loader2 } from "lucide-react";
import React from "react";

const IconCard = ({ icon, amount, title, loading }) => {
  return (
    <div className="border-slate-700 rounded-md border p-6 flex items-center gap-4 w-full lg:!w-[350px] sm:flex-1">
      <span className="border block w-fit p-2 border-slate-700 rounded-full bg-slate-800 h-fit">
        {icon}
      </span>
      <div>
        {loading ? (
          <div className="w-full h-full flex justify-center items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-300 animate-spin" />
            <p className="text-blue-300">Loading...</p>
          </div>
        ) : (
          <h3 className="text-xl sm:text-[2rem] leading-none font-medium">
            {amount}
          </h3>
        )}
        <p className="mt-1 text-sm sm:text-[1.02rem] text-slate-300 ml-0.5">
          {title}
        </p>
      </div>
    </div>
  );
};

export default IconCard;
