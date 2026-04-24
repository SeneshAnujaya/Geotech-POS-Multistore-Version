import {
  Album,
  Archive,
  BadgeAlertIcon,
  BoxIcon,
  ClipboardList,
  Icon,
  Layers,
  LogOut,
  Menu,
  Repeat,
  ShoppingBag,
  StoreIcon,
  UserCircle,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setIsSidebarCollapsed } from "../redux/uiSetting/uiSettingsSlice";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { showSuccessToast } from "./ToastNotification";
import showErrorToast from "./ToastNotification";
import axios from "axios";
import { signOut } from "../redux/user/userSlice";
import LogoutConfirm from "./LogoutConfirm";
import { useState } from "react";
import { clearSelectedStoreId } from "../redux/store/storeSlice";

const apiUrl = import.meta.env.VITE_API_URL;

const SidebarLink = ({ href, icon: Icon, label, isCollapsed }) => {
  const { pathname } = useLocation();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link to={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        } hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
          isActive ? "bg-blue-900 text-white" : "text-white"
        }`}
      >
        <Icon className={`w-6 h-6`} />
        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-gray-300`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isSidebarCollapsed } = useSelector((state) => state.uisetting);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.user);
  const role = currentUser.rest.role;  

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${apiUrl}/auth/signout`);
      dispatch(signOut());
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      showSuccessToast("Logged out successfully!");
      dispatch(clearSelectedStoreId());
      navigate("/sign-in");
    } catch (error) {
      console.log(error);

      showErrorToast("Error logging out, please try again");
    }
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:64"
  } bg-slate-900 transition-all duration-300 overflow-hidden h-full shadow-md z-40 border-r border-slate-700`;

  return (
    <div className={sidebarClassNames}>
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <div className="text-blue-400 font-medium text-2xl">G</div>
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-semibold text-2xl`}
        >
          GEOTECH
        </h1>
        <button
          className="md:hidden px-3 py-3 bg-gray-600 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* links */}
      <div className="flex-grow mt-8">
        <SidebarLink
          href="/"
          icon={Archive}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/orders"
          icon={ShoppingBag}
          label="Orders"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/categories"
          icon={ClipboardList}
          label="Categories"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/products"
          icon={BoxIcon}
          label="Products"
          isCollapsed={isSidebarCollapsed}
        />
         <SidebarLink
          href="/stocks"
          icon={Layers}
          label="Stocks"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/sales"
          icon={Album}
          label="Sale Records"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/duesales"
          icon={BadgeAlertIcon}
          label="Outstanding Sales"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/returncancelSales"
          icon={Repeat}
          label="Return & Cancel"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/Wholesales"
          icon={Users}
          label="Registered Clients"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/users"
          icon={UserCircle}
          label="Users"
          isCollapsed={isSidebarCollapsed}
        />
        {role == 'ADMIN' && (
        
        <SidebarLink
          href="/stores"
          icon={StoreIcon}
          label="Stores"
          isCollapsed={isSidebarCollapsed}
        />
        )}
        <div
          className={`cursor-pointer flex items-center ${
            isSidebarCollapsed
              ? "justify-center py-4"
              : "justify-start px-8 py-4"
          } hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors`}
          onClick={() => setIsModalOpen(true)}
        >
          <LogOut className={`w-6 h-6 text-sky-300`} />
          <span
            className={`${
              isSidebarCollapsed ? "hidden" : "block"
            } font-medium text-gray-300`}
          >
            Logout
          </span>
        </div>
        {/* MODAL */}
        <LogoutConfirm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          logOut={handleLogout}
        />
      </div>

      {/* footer */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-400">&copy; 2024 GEOTECH</p>
      </div>
    </div>
  );
};

export default Sidebar;
