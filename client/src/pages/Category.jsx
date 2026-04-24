import { useEffect, useState, Suspense, lazy } from "react";
import MainLayout from "../components/MainLayout";
import {
  DataGrid,
  GridActionsCellItem,
  GridRowEditStartReasons,
  GridRowEditStopReasons,
  GridRowModes,
} from "@mui/x-data-grid";
import { useSelector } from "react-redux";
import { fetchCategories } from "../redux/categories/categorySlice";
import {
  EditIcon,
  ExternalLinkIcon,
  ImageUp,
  PlusCircleIcon,
  SaveIcon,
  Search,
  Trash2,
} from "lucide-react";
import CategoryModal from "../components/CategoryModal";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import axios from "axios";
import {
  useFetchCategoriesQuery,
  useFetchFilteredCategoriesQuery,
} from "../redux/apiSlice";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "../redux/apiSlice";
import PlaceholderImage from "../assets/place-holder-img.jpeg";
import { formatDateTime } from "../dateUtil";
import SearchBar from "../components/SearchBar";
import ConfirmModal from "../components/ConfirmModal";

const apiUrl = import.meta.env.VITE_BACKEND_URL;

const Category = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const [editableRowId, setEditableRowId] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

  const [rowModesModel, setRowModesModel] = useState({});
  const [rows, setRows] = useState([]);

  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();

  const {
    data: categories = { data: [] },
    error,
    isLoading,
  } = useFetchCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const { data: filteredCategories = { data: [] } } =
    useFetchFilteredCategoriesQuery({ searchTerm: debouncedSearchTerm },  {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  const { currentUser } = useSelector((state) => state.user);

  const role = currentUser.rest.role || "EMPLOYEE";

  const [showLoader, setShowLoader] = useState(true);

  // Delay loader removal slightly to avoid flashing
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (!isLoading) setShowLoader(false);
    }, 100); // 500ms delay, adjust as needed

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

  useEffect(() => {
    if (filteredCategories.data) {
      const updatedRows = filteredCategories.data.map((category) => ({
        id: category.categoryId,
        col1: category.categoryId,
        col2: category.categoryPic,
        col3: category.name,
        col4: formatDateTime(category.createdAt),
      }));
      // setRows(updatedRows);
      if (JSON.stringify(rows) !== JSON.stringify(updatedRows)) {
        setRows(updatedRows);
      }
    }
  }, [filteredCategories]);

  const columns = [
    // { field: "col1", headerName: "Id", width: 100, editable: false },
    {
      field: "col2",
      headerName: "Image",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="py-3 px-4">
            <img
              src={
                params.value
                  ? `${apiUrl}/uploads/${params.value}`
                  : PlaceholderImage
              }
              alt="category-pic"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
        );
      },
      renderEditCell: (params) => {
        return (
          <div className="w-full">
            <label htmlFor="image" className=" w-full block px-6 py-6">
              <ImageUp className="w-7 h-7" />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, params.row.id)}
                style={{ width: "150px" }}
                id="image"
                hidden
              />
            </label>
          </div>
        );
      },
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col3",
      headerName: "Category",
      width: 200,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col4",
      headerName: "CreatedAt",
      width: 200,
      editable: false,
    },
  ];

  if (role === "ADMIN") {
    columns.push({
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      cellClassName: "actions",
      hide: role !== "ADMIN",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (role === "ADMIN") {
          if (isInEditMode) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                sx={{ color: "primary.main" }}
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                icon={<ExternalLinkIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ];
          }

          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<Trash2 className="w-5 -h5 hover:text-red-700" />}
              label="Delete"
              // onClick={() => handleDeleteClick(id)}
              onClick={() => {
                setSelectedDeleteId(id);
                setIsConfirmModalOpen(true);
              }}
              color="inherit"
            />,
          ];
        }
        return [];
      },
    });
  }

  const handleCreateCategory = async (formData) => {
    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("categoryPic", formData.categoryPic);

    try {
      const response = await createCategory(formDataObj).unwrap();

      showSuccessToast("Category created successfully!");
      setUploadPercentage(0);
      setIsModalOpen(false);
    } catch (error) {
      if (error.data) {
        showErrorToast(
          error.data.message || "An unexpected server error occurred"
        );
      } else {
        showErrorToast("An unexpected error occurred");
      }
      setUploadPercentage(0);
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await deleteCategory(id).unwrap();

      showSuccessToast("Category deleted successfully!");
    } catch (error) {
      if (error.data) {
        showErrorToast(error.data.message || "An unexpected error occurred");
      } else {
        showErrorToast("An unexpected error occurred");
      }
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    } else {
      const updatedRow = { ...editedRow };
      if (updatedRow.col2File) {
        updatedRow.col2File = null;
      }

      setRows(rows.map((row) => (row.id === id ? updatedRow : row)));
    }

    // if (editedRow.col2File) {
    //   editedRow.col2File = null;
    // }
  };

  const processRowUpdate = async (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

    await handleCategoryUpdateReq(updatedRow);

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleCategoryUpdateReq = async (updatedRow) => {
    const { id, col3, col2File } = updatedRow;

    try {
      const formData = new FormData();
      formData.append("name", col3);
      if (col2File) formData.append("categoryPic", col2File);

      const response = await updateCategory({ id, data: formData }).unwrap();

      if (response.success) {
        showSuccessToast("Category updated successfully!");
      } else {
        showErrorToast("Failed to update category");
      }
    } catch (error) {
      if (error.data) {
        showErrorToast(error.data.message || "An unexpected error occurred");
      } else {
        showErrorToast("An unexpected error occurred");
      }
    }
  };

  const handleImageChange = (e, rowId) => {
    const file = e.target.files[0];
    if (!file) return;

    const updatedRows = rows.map((row) => {
      return row.id === rowId ? { ...row, col2File: file } : row;
    });

    setRows(updatedRows);
  };

  // loading skeleton
  const renderTableSkeleton = () => (
    <Box sx={{ width: "100%", maxWidth: "fit-content" }} className="mt-8">
      {Array.from(new Array(6)).map((_, rowIndex) => (
        <Box key={rowIndex} display="flex" alignItems="center" mb={1}>
          {Array.from(new Array(4)).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="rounded"
              width={300}
              height={50}
              sx={{ marginRight: 1 }}
              animation="wave"
            />
          ))}
        </Box>
      ))}
    </Box>
  );

  if (error || !filteredCategories) {
    return (
      <MainLayout>
        <div className=" text-red-700 py-4 px-4">Failed to get categories</div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      {isLoading ? (
        <div className="py-4 px-4">Loading...</div>
      ) : (
        <div className="px-4 md:px-8 py-5 flex flex-col border border-slate-700 rounded-md">
          {/* Header bar */}
          <div className="flex justify-between items-center mb-2 pb-6 flex-wrap gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-0">
              Categories
            </h1>
            <div className="flex items-center gap-5 flex-wrap">
              {/* search bar */}
              <SearchBar
                setSearchTerm={setSearchTerm}
                placeholder="Search by Category Name..."
              />

              {role == "ADMIN" && (
                <button
                  className="flex items-center bg-blue-700 hover:bg-blue-700 text-gray-200 font-normal py-2 px-3 rounded-md text-md text-[0.93rem] sm:text-base"
                  onClick={() => setIsModalOpen(true)}
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  Add Category
                </button>
              )}
            </div>
          </div>
          {showLoader || isLoading ? (
            renderTableSkeleton()
          ) : (
            <div className="border-0 sm:border border-slate-700 rounded-md px-0 sm:px-4">
              <div
                style={{ width: "100%", maxWidth: "fit-content" }}
                className="mt-8 h-[680px]"
              >
                <Suspense fallback={<CircularProgress color="primary" />}>
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={(error) => {
                      console.error("Row update error:", error);
                      // Optionally, show an error toast notification
                      showErrorToast("Failed to update row.");
                    }}
                    className="rounded-lg border !border-gray-400 !text-gray-200"
                    sx={{
                      // Style for column headers
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#0f172a", // Background color for header
                        color: "#fff", // Text color for header
                      },
                      // Style for virtual scroller (rows area)
                      "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: "transparent", // Background color for rows
                      },
                      // Style for footer container
                      "& .MuiDataGrid-footerContainer": {
                        backgroundColor: "transparent", // Background color for footer
                      },
                      // Style for footer cells
                      "& .MuiDataGrid-footerCell": {
                        color: "#fff", // Text color for footer cells
                      },
                      // Style for toolbar container
                      "& .MuiDataGrid-toolbarContainer": {
                        backgroundColor: "transparent", // Background color for toolbar
                      },
                      // Style for checkbox color
                      "& .MuiCheckbox-root": {
                        color: "#fff", // Checkbox color
                      },
                      // Style for icons (like pagination and filtering icons)
                      "& .MuiDataGrid-iconSeparator": {
                        color: "#fff", // Color for separator icon
                      },
                      "& .MuiDataGrid-iconButton": {
                        color: "#fff", // Color for icon buttons (e.g., pagination controls)
                      },
                      // Style for pagination controls
                      "& .MuiPaginationItem-root": {
                        color: "#fff", // Color for pagination item text
                      },
                      "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                    getRowHeight={() => "auto"}
                    // onCellEditStop={handleRowEditChange}
                  />
                </Suspense>
              </div>
              {/* MODAL */}
              <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateCategory}
                percentage={uploadPercentage}
              />
              {/* Delete Confirm Modal */}
             
              <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                  setSelectedDeleteId(null);
                  setIsConfirmModalOpen(false);
                }}
                onConfirm={() => {
                  if (selectedDeleteId) {
                    handleDeleteClick(selectedDeleteId);
                    setIsConfirmModalOpen(false);
                    setSelectedDeleteId(null);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default Category;
