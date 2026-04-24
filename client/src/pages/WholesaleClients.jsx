import React, { useEffect, Suspense } from "react";
import MainLayout from "../components/MainLayout";
import { useState } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import { PlusCircleIcon, Search } from "lucide-react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import DataTable from "../components/DataTable";
import { useDispatch, useSelector } from "react-redux";
import WholesaleClientAddModal from "../components/WholesaleClientAddModal";
import { fetchWholesaleClients } from "../redux/wholesaleclients/wholesaleclientSlice";
import {
  useFetchWholesaleClientsQuery,
  useCreateWholesaleClientMutation,
  useDeleteWholesaleClientMutation,
  useUpdateWholesaleClientMutation,
} from "../redux/apiSlice";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import { formatDateTime } from "../dateUtil";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const WholesaleClients = () => {
  const [users, setusers] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();

  const { currentUser } = useSelector((state) => state.user);

  const {
    data: wholesaleClients = { data: [] },
    error,
    isLoading,
  } = useFetchWholesaleClientsQuery( {searchTerm:
    debouncedSearchTerm 
  });

  const [createWholesaleClient, { isLoading: isCreating }] =
    useCreateWholesaleClientMutation();

  const [deleteWholesaleClient, { isLoading: isDeleting }] =
    useDeleteWholesaleClientMutation();
  const [updateWholesaleClient, { isLoading: isUpdating }] =
    useUpdateWholesaleClientMutation();

  const [showLoader, setShowLoader] = useState(true);
  const [activeTab, setActiveTab] = useState("REGULAR");

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (!isLoading) setShowLoader(false);
    }, 100);

    return () => clearTimeout(loaderTimer);
  }, [isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const role = currentUser.rest.role;

  const navigate = useNavigate();

  const handleMoreInfo = (id) => {
    navigate(`/moreclientinfo/${id}`, { state: { clientId : id } })
  }

  // DATA GRID ROWS COLUMNS
  const rows = wholesaleClients.data
    .filter((client) =>
      activeTab === "REGULAR"
        ? client.type === "REGULAR"
        : client.type === "BULK"
    )
    .map((client) => ({
      id: client.bulkBuyerId,
      col1: client.bulkBuyerId,
      col2: client.name,
      col3: client.phoneNumber,
      col4: client.email,
      col5: client.companyName,
      col6: Number(client.outstandingBalance).toFixed(2),
      col7: formatDateTime(client.createdAt),
    }));

  const columns = [
    // { field: "col1", headerName: "Id", width: 100, editable: false },
    {
      field: "col2",
      headerName: "Name",
      width: 200,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col3",
      headerName: "Phone Number",
      width: 150,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col4",
      headerName: "Email",
      width: 200,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col5",
      headerName: "Company Name",
      width: 200,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col6",
      headerName: "OutsandingBalance",
      width: 100,
    },
    {
      field: "col7",
      headerName: "Created at",
      width: 200,
    },
    {
      field: "col8",
      headerName: "More Info",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          <button
            variant="contained"
            color="primary"
            className="bg-blue-800 flex rounded-full h-6 items-center px-3"
            onClick={() => handleMoreInfo(params.row.id)}
          >
            More
          </button>
        </div>
      ),
    },
   
  ];

  const handleCreateWholesaleClient = async (formData) => {
    try {
      const response = await createWholesaleClient(formData).unwrap();
      if (!response.success) {
        showErrorToast(data.message || "Error occurred");
        return;
      }

      showSuccessToast("Client created successfully!");
    } catch (error) {
      console.log(error);

      if (error.data) {
        showErrorToast(
          error.data.message || "An unexpected server error occurred"
        );
      } else {
        showErrorToast("An unexpected error occurred");
      }
    }
  };

  const renderTableSkeleton = () => (
    <Box sx={{ width: "100%", maxWidth: "fit-content" }} className="mt-8">
      {Array.from(new Array(5)).map((_, rowIndex) => (
        <Box key={rowIndex} display="flex" alignItems="center" mb={1}>
          {Array.from(new Array(6)).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rounded"
              width={220}
              height={60}
              sx={{ marginRight: 1 }}
              animation="wave"
            />
          ))}
        </Box>
      ))}
    </Box>
  );

  return (
    <MainLayout>
      <div className="px-4 md:px-8 py-4 flex flex-col border-slate-700 rounded-md border min-h-[800px]">
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-0">Registered Clients</h1>
          <div className="flex items-center gap-4 flex-wrap">
           <SearchBar setSearchTerm={setSearchTerm} placeholder="Search by Name Phone Number Company Name..."/>
          {/* {role == "ADMIN" && ( */}
            <button
              className="flex items-center bg-blue-700 hover:bg-blue-700 text-gray-200 font-normal py-2 px-3 rounded-md text-md"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Add Client
            </button>
          {/* )} */}
          </div>
        </div>

        {showLoader || isLoading ? (
          renderTableSkeleton()
        ) : (
          <>
            {/* tab box */}
            <div className="tabs-wrap">
              <div className="flex items-center border-b border-slate-700 gap-4">
                <button
                  onClick={() => setActiveTab("REGULAR")}
                  className={`py-2 px-4 rounded-sm   text-slate-200 text-[0.95rem] ${
                    activeTab === "REGULAR"
                      ? "!border-b-4  border-blue-500 !text-blue-300 font-medium"
                      : " text-gray-500"
                  }`}
                >
                  Regular Clients
                </button>
                <button
                  onClick={() => setActiveTab("BULK")}
                  className={`py-2 px-2 rounded-sm   ${
                    activeTab === "BULK"
                      ? "border-b-4 border-blue-500 !text-blue-300 font-medium"
                      : "text-slate-200"
                  }`}
                >
                  Wholesale Clients
                </button>
              </div>
              {/* Tab Content */}
              <div className="mt-4 relative w-full">
                {activeTab === "REGULAR" && (
                  <div
                    className={`transition-opacity duration-500 ease-in-out w-full ${
                      activeTab === "REGULAR"
                        ? "opacity-100"
                        : "opacity-0 absolute"
                    } `}
                  >
                    <div>
                      <div className="w-full max-w-fit mt-8 h-[680px]">
                        <Suspense
                          fallback={<CircularProgress color="primary" />}
                        >
                          <DataTable
                            rows={rows}
                            columns={columns}
                            role={role}
                            deleteRow={deleteWholesaleClient}
                            updateRow={updateWholesaleClient}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "BULK" && (
                  <div
                    className={`transition-opacity duration-500 ease-in-out ${
                      activeTab === "BULK"
                        ? "opacity-100"
                        : "opacity-0 absolute"
                    }`}
                  >
                    <div>
                      <div className="w-full max-w-fit mt-8 h-[680px]">
                        <Suspense
                          fallback={<CircularProgress color="primary" />}
                        >
                          <DataTable
                            rows={rows}
                            columns={columns}
                            role={role}
                            deleteRow={deleteWholesaleClient}
                            updateRow={updateWholesaleClient}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* tab end */}
            {/* MODAL */}
            <WholesaleClientAddModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onCreate={handleCreateWholesaleClient}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default WholesaleClients;
