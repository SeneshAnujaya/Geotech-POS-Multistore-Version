import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  const { isSidebarCollapsed } = useSelector((state) => state.uisetting);

  return (
    <div className="flex bg-slate-900 text-gray-100 w-full min-h-screen">
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-5 sm:px-9 ${
          isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
        } `}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
