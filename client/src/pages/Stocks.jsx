import { useEffect, useState, Suspense, lazy } from "react";
import MainLayout from "../components/MainLayout";
import { useSelector } from "react-redux";
import { PackagePlus } from "lucide-react";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import {
  useFetchStocksQuery,
  useCreateStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useFetchPaginatedProductsQuery,
} from "../redux/apiSlice";
import { CircularProgress, Box, Skeleton } from "@mui/material";
import { formatDateTime } from "../dateUtil";
import SearchBar from "../components/SearchBar";
import StockAddModal from "../components/StockAddModal";

const DataTable = lazy(() => import("../components/DataTable"));

const Stocks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();
  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  // get stock data
   const {
    data: stocks = { data: [] },
    refetch,
    isLoading: isStocksLoading,
    error: isStockError,
  } = useFetchStocksQuery({
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

  const [createStock, { isLoading: isStockCreating }] = useCreateStockMutation();
  const [deleteStock, { isLoading: isDeletingStock }] = useDeleteStockMutation();
  const [updateStock, { isLoading: isUpdating }] = useUpdateStockMutation();

  const { currentUser } = useSelector((state) => state.user);

  const role = currentUser.rest.role;

  const [showLoader, setShowLoader] = useState(true);

  // Refetch Queries
   const { refetch: refetchPaginatedProducts } = useFetchPaginatedProductsQuery({
      page: 0,
      limit: 50,
      searchTerm: "",
      storeId: selectedStoreId,
    });

  // Delay loader removal slightly to avoid flashing
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (!isStocksLoading) setShowLoader(false);
    }, 100);

    return () => clearTimeout(loaderTimer);
  }, [isStocksLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const rows = stocks.data.map((stk) => ({
    id: stk.id,
    col1: stk.product.sku,
    col2: stk.product.name,
    col3: stk.store.name,
    col4: stk.quantity,
    col5: formatDateTime(stk.createdAt),
    col6: formatDateTime(stk.updatedAt),
  }));

  const columns = [
    {
      field: "col1",
      headerName: "SKU",
      width: 150,
      // editable: (params) => params.row.id === editableRowId,
    },
    {
      field: "col2",
      headerName: "Product",
      width: 200,
    },
    {
      field: "col3",
      headerName: "Store",
      width: 150,
    },
    {
      field: "col4",
      headerName: "Quantity",
      width: 120,
      editable: (params) => params.row.id === editableRowId,
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
      field: "col5",
      headerName: "Created At",
      width: 200,
    },
    {
      field: "col6",
      headerName: "Updated At",
      width: 200,
    },
  ];

  const handleCreateStock = async (formData) => {

    try {
      const response = await createStock(formData).unwrap();

      if (!response.success) {
        showErrorToast(data.message || "Error occurred");
        return;
      }
      showSuccessToast("Stock is created successfully!");
      refetch();
      refetchPaginatedProducts();
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

  if (isStockError || !stocks) {
    return (
      <MainLayout>
        <div className=" text-red-700 py-4 px-4">Failed to get Stocks</div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="px-4 md:px-8 py-4 flex flex-col border-slate-700 border rounded-md">
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-0">
            Stocks
          </h1>
          <div className="flex items-center gap-5 flex-wrap">
            {/* search bar */}
            <SearchBar
              setSearchTerm={setSearchTerm}
              placeholder="Search by SKU Name ..."
            />

            {role == "ADMIN" && (
              <button
                className="flex items-center bg-blue-700 hover:bg-blue-700 text-gray-200 font-normal py-2 px-3 rounded-md text-md"
                onClick={() => setIsStockModalOpen(true)}
              >
                <PackagePlus className="w-5 h-5 mr-2" />
                Add Stock
              </button>
            )}
          </div>
        </div>

        {showLoader || isStocksLoading ? (
          renderTableSkeleton()
        ) : (
          <div className="w-full">
            <div
              style={{ width: "100%", maxWidth: "100%" }}
              className="mt-8 h-[680px]"
            >
              <Suspense fallback={<CircularProgress color="primary" />}>
                <DataTable
                  rows={rows}
                  columns={columns}
                  role={role}
                  deleteRow={deleteStock}
                  updateRow={updateStock}
                  pagination={true}
                  paginationModel={paginationModel}
                  setPaginationModel={setPaginationModel}
                  rowCount={stocks.total || 0}
                  loading={isStocksLoading}
                />
              </Suspense>
            </div>
            {/* MODAL */}         
            <StockAddModal isOpen={isStockModalOpen}
              onClose={() => setIsStockModalOpen(false)}
              onCreate={handleCreateStock} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Stocks;
