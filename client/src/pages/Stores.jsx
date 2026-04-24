import React, { useEffect } from "react";
import MainLayout from "../components/MainLayout";
import { Suspense, useState } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import { PlusCircleIcon } from "lucide-react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import UserAddModal from "../components/UserAddModal";
import DataTable from "../components/DataTable";
import { useSelector } from "react-redux";
import {
  useFetchUsersQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useFetchStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} from "../redux/apiSlice";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import { formatDateTime } from "../dateUtil";
import StoreAddModal from "../components/StoreAddModal";

const Stores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: stores,
    isLoading: isStoresLoading,
    isError,
    refetch,
  } = useFetchStoresQuery();

  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating } ] = useUpdateStoreMutation();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();


  const { currentUser } = useSelector((state) => state.user);
  const role = currentUser.rest.role;

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (!isStoresLoading) setShowLoader(false);
    }, 100);

    return () => clearTimeout(loaderTimer);
  }, [isStoresLoading]);

  // DATA GRID ROWS COLUMNS
  const rows =
    stores?.data?.map((store) => ({
      id: store.storeId,
      col1: store.storeId,
      col2: store.name,
      col3: store.address,
      col4: store.contact,
      col5: store.status,
      col6: formatDateTime(store.createdAt),
      // col6: formatDateTime(store.updatedAt),
    })) ?? [];

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
      headerName: "Address",
      width: 200,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col4",
      headerName: "Contact Info",
       editable: (params) => params.row.id === editableRowId,
      width: 200,
    },
     {
      field: "col5",
      headerName: "Status",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center  h-full">
          <button
            variant="contained"
            color="primary"
            className={`bg-blue-800 flex rounded-full  h-[20px] pt-0.5 items-center px-3 text-[12px] font-medium leading-none ${
              params.value === "ACTIVE"
                ? "bg-green-700"
                : params.value < 5
                ? "bg-orange-600"
                : "bg-blue-800"
            }`}
          >
            {params.value}
          </button>
        </div>
      ),
    },
    {
      field: "col6",
      headerName: "CreatedAt",
      width: 200,
    },
    // {
    //   field: "col6",
    //   headerName: "UpdatedAt",
    //   width: 200,
    // },
  ];

  const handleCreateStore = async (formData) => {
    try {
      const response = await createStore(formData).unwrap();

      if (!response.success) {
        showErrorToast(data.message || "Error occurred");
        return;
      }

      showSuccessToast("Store created successfully!");
      refetch();
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
      {Array.from(new Array(4)).map((_, rowIndex) => (
        <Box key={rowIndex} display="flex" alignItems="center" mb={1}>
          {Array.from(new Array(5)).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rounded"
              width={300}
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
      <div className="px-4 md:px-8 py-8 flex flex-col border-slate-700 rounded-md border">
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold">Manage Stores</h1>
          {role == "ADMIN" && (
            <button
              className="flex items-center bg-blue-700 hover:bg-blue-700 text-gray-200 font-normal py-2 px-3 rounded-md text-md text-[0.95rem] sm:text-base"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Add Store
            </button>
          )}
        </div>

        {showLoader || isStoresLoading ? (
          renderTableSkeleton()
        ) : (
          <>
            <div>
              <div className="w-full max-w-fit mt-8 h-[680px]">
                <Suspense fallback={<CircularProgress color="primary" />}>
                  <DataTable
                    rows={rows}
                    columns={columns}
                    role={role}
                    deleteRow={deleteStore}
                    updateRow={updateStore}
                  />
                </Suspense>
              </div>
            </div>
            {/* MODAL */}
            <StoreAddModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onCreate={handleCreateStore}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Stores;
