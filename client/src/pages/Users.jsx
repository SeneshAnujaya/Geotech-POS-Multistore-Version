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
} from "../redux/apiSlice";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import { formatDateTime } from "../dateUtil";

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  const {
    data: users = { data: [] },
    error,
    isLoading,
    refetch,
  } = useFetchUsersQuery({storeId: selectedStoreId});

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateuser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const { currentUser } = useSelector((state) => state.user);
  const role = currentUser.rest.role;

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (!isLoading) setShowLoader(false);
    }, 100);

    return () => clearTimeout(loaderTimer);
  }, [isLoading]);

  const filterusers = users.data.filter((user) => user.role !== "ADMIN");

  // DATA GRID ROWS COLUMNS
  const rows = filterusers.map((user) => ({
    id: user.id,
    col1: user.id,
    col2: user.name,
    col3: user.email,
    col4: user.role,
    col5: formatDateTime(user.createdAt),
    col6: formatDateTime(user.updatedAt),
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
      headerName: "Email",
      width: 200,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col4",
      headerName: "Role",
      width: 200,
    },
    {
      field: "col5",
      headerName: "CreatedAt",
      width: 200,
    },
    {
      field: "col6",
      headerName: "UpdatedAt",
      width: 200,
    },
  ];


  const handleCreateUser = async (formData) => {
    try {
      const response = await createUser(formData).unwrap();

      if (!response.success) {
        showErrorToast(data.message || "Error occurred");
        return;
      }

      showSuccessToast("Account created successfully!");
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
          <h1 className="text-xl sm:text-2xl font-semibold">Users</h1>
          {role == "ADMIN" && (
            <button
              className="flex items-center bg-blue-700 hover:bg-blue-700 text-gray-200 font-normal py-2 px-3 rounded-md text-md text-[0.95rem] sm:text-base"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Add user
            </button>
          )}
        </div>

        {showLoader || isLoading ? (
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
                    deleteRow={deleteUser}
                    updateRow={updateuser}
                  />
                </Suspense>
              </div>
            </div>
            {/* MODAL */}
            <UserAddModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onCreate={handleCreateUser}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Users;
