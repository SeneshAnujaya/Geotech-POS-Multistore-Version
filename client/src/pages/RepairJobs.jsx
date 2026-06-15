import { useEffect, useState, Suspense, lazy } from "react";
import MainLayout from "../components/MainLayout";
import { useSelector } from "react-redux";
import { Layers3Icon } from "lucide-react";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import {
  useUpdateStockMutation,
  useDeleteStockMutation,
  useCreateRepairjobMutation,
  useFetchRepairjobsQuery,
} from "../redux/apiSlice";
import { CircularProgress, Box, Skeleton } from "@mui/material";
import { formatDateTime } from "../dateUtil";
import SearchBar from "../components/SearchBar";
import RepairAddModal from "../components/RepairAddModal";
import repairReceiptPDF from "../components/RepairReceiptPDF";

const DataTable = lazy(() => import("../components/DataTable"));

const RepairJobs = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();
  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  // get stock data
  const {
    data: repairjobs = { data: [] },
    refetch,
    isLoading: isRepairjobsLoading,
    error: isRepairjobsError,
  } = useFetchRepairjobsQuery(
    {
      page: paginationModel.page,
      limit: paginationModel.pageSize,
      searchTerm: debouncedSearchTerm,
      storeId: selectedStoreId,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );


  useEffect(() => {
    refetch();
  }, [paginationModel, refetch]);

  // const [createStock, { isLoading: isStockCreating }] = useCreateStockMutation();
  const [createRepairjob, { isLoading: isRepairjobLoading }] =
    useCreateRepairjobMutation();
  const [deleteStock, { isLoading: isDeletingStock }] =
    useDeleteStockMutation();
  const [updateStock, { isLoading: isUpdating }] = useUpdateStockMutation();

  const { currentUser } = useSelector((state) => state.user);

  const role = currentUser.rest.role;

  const [showLoader, setShowLoader] = useState(true);


  // Delay loader removal slightly to avoid flashing
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (!isRepairjobLoading) setShowLoader(false);
    }, 100);

    return () => clearTimeout(loaderTimer);
  }, [isRepairjobLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const rows = repairjobs?.repairs?.map((repair) => ({
    id: repair.repairJobId,

    col1: repair.jobNumber,
    col2: repair.customerName,
    col3: repair.customerPhone,
    col4: repair.deviceType,
    col5: repair.model,
    col6: repair.serialNumber,
    col7: repair.technician,
    col8: repair.status,
    // col9: repair.store?.name || "-",
    col9: repair.estimatedCost,
    col10: formatDateTime(repair.createdAt),
  }));

  const columns = [
    {
      field: "col1",
      headerName: "Job No",
      width: 150,
    },
    {
      field: "col2",
      headerName: "Customer",
      width: 200,
    },
    {
      field: "col3",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "col4",
      headerName: "Device",
      width: 100,
    },
    {
      field: "col5",
      headerName: "Model",
      width: 130,
    },
    {
      field: "col6",
      headerName: "Serial Number",
      width: 120,
    },
    {
      field: "col7",
      headerName: "Technician",
      width: 120,
    },
    {
      field: "col8",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const status = params.value;

        return (
          <div className="flex items-center h-full">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium
              ${status === "RECEIVED"
                  ? "bg-blue-700"
                  : status === "DIAGNOSING"
                    ? "bg-yellow-600"
                    : status === "REPAIRING"
                      ? "bg-orange-600"
                      : status === "READY"
                        ? "bg-green-600"
                        : status === "COMPLETED"
                          ? "bg-emerald-700"
                          : "bg-red-700"
                }
            `}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    // {
    //   field: "col9",
    //   headerName: "Store",
    //   width: 100,
    // },
    {
      field: "col9",
      headerName: "Etimated Cost",
      width: 120,
    },
    {
      field: "col10",
      headerName: "Created At",
      width: 180,
    },
  ];

  const handleCreateRepairjob = async (formData) => {
    try {
      // const response = await createRepairjob(formData).unwrap();

      // if (!response.success) {
      //   showErrorToast(data.message || "Error occurred");
      //   return;
      // }
      // showSuccessToast("Repairjob is created successfully!");
      
      
      // repairReceiptPDF(response.repair)
      // refetch();
      // repairReceiptPDF(formData);
      repairReceiptPDF({
  ...formData,
  jobNumber: "TEST-001",
  status: "RECEIVED",
  createdAt: new Date(),
});
    } catch (error) {
      console.log(error);

      if (error.data) {
        console.log(error.data.message);

        showErrorToast(
          error.data.message || "An unexpected server error occurred",
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

  if (isRepairjobsError || !repairjobs) {
    return (
      <MainLayout>
        <div className=" text-red-700 py-4 px-4">Failed to get Repairjobs</div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="px-4 md:px-7 py-7 flex flex-col border-slate-800 border rounded-md bg-slate-900">
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-0">
            Repair Jobs
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
                onClick={() => setIsRepairModalOpen(true)}
              >
                <Layers3Icon className="w-5 h-5 mr-2" />
                Add Repair
              </button>
            )}
          </div>
        </div>

        {showLoader || isRepairjobsLoading ? (
          renderTableSkeleton()
        ) : (
          <div className="w-full">
            <div
              style={{ width: "100%", maxWidth: "100%" }}
              className="mt-8 h-[680px] bg-darkBlue"
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
                  rowCount={repairjobs.total || 0}
                  loading={isRepairjobLoading}
                />
              </Suspense>
            </div>
            {/* MODAL */}
            <RepairAddModal
              isOpen={isRepairModalOpen}
              onClose={() => setIsRepairModalOpen(false)}
              onCreate={handleCreateRepairjob}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RepairJobs;
