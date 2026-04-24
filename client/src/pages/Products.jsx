import { useEffect, useState, Suspense, lazy } from "react";
import MainLayout from "../components/MainLayout";
import {  useSelector } from "react-redux";
import {  PlusCircleIcon } from "lucide-react";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import ProductAddModal from "../components/ProductAddModal";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useFetchPaginatedProductsQuery,
} from "../redux/apiSlice";
import { CircularProgress, Box, Skeleton } from "@mui/material";
import { formatDateTime } from "../dateUtil";
import SearchBar from "../components/SearchBar";

const DataTable = lazy(() => import("../components/DataTable"));

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();
  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  const {
    data: paginatedProducts = { data: [] },
    refetch,
    isLoading: isPaginatedProductsLoading,
    error,
  } = useFetchPaginatedProductsQuery({
    page: paginationModel.page,
    limit: paginationModel.pageSize,
    searchTerm: debouncedSearchTerm,
    storeId: selectedStoreId,
  },  {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  useEffect(() => {
    refetch();
  }, [paginationModel, refetch]);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const [deleteproduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const { currentUser } = useSelector((state) => state.user);

  const role = currentUser.rest.role;

  const [showLoader, setShowLoader] = useState(true);

  // Delay loader removal slightly to avoid flashing
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (!isPaginatedProductsLoading) setShowLoader(false);
    }, 100);

    return () => clearTimeout(loaderTimer);
  }, [isPaginatedProductsLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  console.log(paginatedProducts);

  const rows = paginatedProducts.data.map((product) => ({
    id: product.sku,
    col1: product.sku,
    col2: product.name,
    col3: parseFloat(product.costPrice),
    col4: parseFloat(product.retailPrice),
    col5: Number(product.wholesalePrice),
    col6: Number(product.quantity),
    col7: product.brandName,
    col8: product.category.name,
    col9: product.warrantyPeriod,
    col10: formatDateTime(product.createdAt),
  }));

  const columns = [
    {
      field: "col1",
      headerName: "SKU",
      width: 130,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col2",
      headerName: "Name",
      width: 180,
      editable: (params) => params.row.id === editableRowId,
    },
    ...(role === "ADMIN"
      ? [
          {
            field: "col3",
            headerName: "Cost Price - LKR",
            width: 130,
            editable: (params) => params.row.id === editableRowId,
          },
        ]
      : []),
    {
      field: "col4",
      headerName: "Retail Price - LKR",
      width: 130,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col5",
      headerName: "Wholesale Price - LKR",
      width: 130,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col6",
      headerName: "Quantity",
      width: 100,
      // editable: (params) => params.row.id === editableRowId,
      renderCell: (params) => (
        <div className="flex items-center  h-full">
          <button
            variant="contained"
            color="primary"
            className={`bg-blue-800 flex rounded-full  h-[20px] pt-0.5 items-center px-3 text-[12px] font-medium leading-none ${
              params.value === 0
                ? "bg-red-700"
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
      field: "col7",
      headerName: "Brand",
      width: 150,
      editable: (params) => params.row.id === editableRowId,
    },
    { field: "col8", headerName: "Category", width: 200 },
    {
      field: "col9",
      headerName: "Warranty",
      width: 150,
      editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col10",
      headerName: "Created At",
      width: 180,
    },
  ];

  const handleCreateProduct = async (formData) => {
    try {
      const response = await createProduct(formData).unwrap();

      if (!response.success) {
        showErrorToast(data.message || "Error occurred");
        return;
      }
      showSuccessToast("Product is created successfully!");
    } catch (error) {
      if (error.data) {
        console.log(error.data.message);

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
              height={50}
              sx={{ marginRight: 1 }}
              animation="wave"
            />
          ))}
        </Box>
      ))}
    </Box>
  );

  if (error || !paginatedProducts) {
    return (
      <MainLayout>
        <div className=" text-red-700 py-4 px-4">Failed to get Products</div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="px-4 md:px-8 py-4 flex flex-col border-slate-700 border rounded-md">
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-0">
            Products
          </h1>
          <div className="flex items-center gap-5 flex-wrap">
            {/* search bar */}
            <SearchBar
              setSearchTerm={setSearchTerm}
              placeholder="Search by SKU Name Brand Category..."
            />

            {role == "ADMIN" && (
              <button
                className="flex items-center bg-blue-700 hover:bg-blue-700 text-gray-200 font-normal py-2 px-3 rounded-md text-md"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Add Product
              </button>
            )}
          </div>
        </div>

        {showLoader || isPaginatedProductsLoading ? (
          renderTableSkeleton()
        ) : (
          <div className="w-full">
            <div
              style={{ width: "100%", maxWidth: "fit-content" }}
              className="mt-8 h-[680px]"
            >
              <Suspense fallback={<CircularProgress color="primary" />}>
                <DataTable
                  rows={rows}
                  columns={columns}
                  role={role}
                  deleteRow={deleteproduct}
                  updateRow={updateProduct}
                  pagination={true}
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={paginatedProducts.total || 0}
                  loading={isPaginatedProductsLoading}
                />
              </Suspense>
            </div>
            {/* MODAL */}
            <ProductAddModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onCreate={handleCreateProduct}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Products;
