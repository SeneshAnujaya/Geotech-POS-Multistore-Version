import {
  Bell,
  Loader2,
  Menu,
  Settings,
  Store,
  Sun,
  Warehouse,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setIsSidebarCollapsed } from "../redux/uiSetting/uiSettingsSlice";
import UserPic from "../assets/user-placeholder.png";
import { useFetchStoresQuery } from "../redux/apiSlice";
import { setSelectedStoreId } from "../redux/store/storeSlice";
import { useEffect } from "react";

const Navbar = () => {
  const { isSidebarCollapsed } = useSelector((state) => state.uisetting);

  const dispatch = useDispatch();

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  // store fetch query
  const { data: stores, isLoading, isError } = useFetchStoresQuery();

  const { currentUser } = useSelector((state) => state.user);

  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  const currentUserName = currentUser.rest.name;
  const currentUserRole = currentUser.rest.role;
  const assignedStoreId = currentUser.rest.storeId;

  useEffect(() => {
    if (currentUserRole === "ADMIN") {
      if (!selectedStoreId && assignedStoreId) {
        dispatch(setSelectedStoreId(assignedStoreId));
      }
    } else if (
      currentUserRole !== "ADMIN" &&
      assignedStoreId &&
      selectedStoreId !== assignedStoreId
    ) {
      dispatch(setSelectedStoreId(assignedStoreId));
    }
  }, [currentUserRole, assignedStoreId, selectedStoreId, dispatch]);

  // useEffect(() => {
  //   if (currentUserRole !== "ADMIN" && assignedStoreId && selectedStoreId !== assignedStoreId) {
  //     dispatch(setSelectedStoreId(assignedStoreId));
  //   }
  // }, [currentUserRole, assignedStoreId, selectedStoreId, dispatch]);

  const selectedStoreName = stores?.data?.find(
    (store) => store.storeId === selectedStoreId
  )?.name;

  const handleStoreIdChange = (storeId) => {
    dispatch(setSelectedStoreId(storeId));
  };

 

  return (
    <div className="flex justify-between items-center w-full mb-7 px-4">
      {/* left side */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-600 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* <div className='relative'>
            <input type='search' placeholder='Start type to search' className='pl-10 pr-4 py-2 w-50 md:w-80 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500 '/>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Bell className='text-gray-500' size={20}/>
            </div>
        </div> */}
      </div>
      {/* right side */}
      <div className="flex justify-between items-center gap-5">
        {/* Store select */}

        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-300 animate-spin" />
            <p className="text-blue-300">Loading stores...</p>
          </div>
        ) : currentUserRole == "ADMIN" ? (
          <div className="flex items-center gap-2  border-slate-700 rounded-md p-2">
            <span>
              <Store className="text-blue-400" size={24} />
            </span>
            <select
              id="store"
              value={selectedStoreId || ""}
              onChange={(e) => handleStoreIdChange(e.target.value)}
              className="block w-full bg-slate-900 text-slate-300 rounded-md border border-slate-700 shadow-sm focus:border-blue-600  focus:ring-blue-600 sm:text-sm py-1.5 focus-visible:border-blue-600 focus-visible:ring-blue-600 focus:outline-none cursor-pointer"
            >
              {/* <option value="">Choose a Store</option> */}

              {stores?.data?.map((store) => (
                <option key={store.storeId} value={store.storeId}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 border-slate-700 rounded-md p-2 bg-slate-900 text-slate-300">
            <Store className="text-blue-400" size={24} />
            <div className="border p-1.5 px-2 rounded-md border-slate-700">
              <p className="text-sm text-slate-300">
                {selectedStoreName || "Store Not Found"}
              </p>
            </div>
          </div>
        )}

        <div className="hidden md:flex justify-between items-center gap-5">
          {/* <div>
                    <button onClick={() => {}}>
                        <Sun className='cursor-pointer text-gray-100' size={24}/>
                    </button>
                </div> */}
          {/* <div className='relative'>
                    <Bell className='cursor-pointer text-gray-500' size={24}/>
                    <span className='absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-500 rounded-full'>4</span>
                </div> */}
          {/* <hr  className='w-0 h-7 border border-solid border-1 border-gray-600 mx-3'/> */}
          <Link to="/profile">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-fit">
                <img
                  src={UserPic}
                  alt="category-pic"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div>
                <span className="font-medium text-[1.05rem]">
                  {currentUserName}
                </span>
                <p className="text-[0.75rem] uppercase text-blue-300">
                  {currentUserRole}
                </p>
              </div>
            </div>
          </Link>
        </div>
        <Link to="/profile">
          <Settings className="cursor-pointer text-gray-300" size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
