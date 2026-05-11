import React, { useEffect, Suspense } from "react";
import MainLayout from "../components/MainLayout";
import { useState } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import { PlusCircleIcon } from "lucide-react";
import { useSelector } from "react-redux";

import { fetchWholesaleClients } from "../redux/wholesaleclients/wholesaleclientSlice";
import {
  useFetchSalesQuery,
  useFetchSingleClientPaymentsQuery,
  useFetchWholesaleClientsQuery,
} from "../redux/apiSlice";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import { formatDateTime } from "../dateUtil";
import { useLocation, useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import generatePDF from "../components/generatePDF";
import DuePayModal from "../components/DuePayModal";
import axios from "axios";
import payReceiptPDF from "../components/payReceiptPDF";
import useCurrentStoreAdress from "../hooks/useCurrentStoreAdress";

const apiUrl = import.meta.env.VITE_API_URL;

const MoreClientInfo = () => {
  const [users, setusers] = useState([]);

  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  // get selected storeID
  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  // Get Current Store Address
  const currentStoreAddress = useCurrentStoreAdress();
 

  const {
    data: wholesaleClients = { data: [] },
    error,
    isLoading,
    refetch: refetchWholesaleClients,
  } = useFetchWholesaleClientsQuery({});

  const { data: clientSales = { data: [] }, isError } = useFetchSalesQuery({ storeId: selectedStoreId });

  const [showLoader, setShowLoader] = useState(true);
  const [activeTab, setActiveTab] = useState("PAYMENT");

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      if (!isLoading) setShowLoader(false);
    }, 100);

    return () => clearTimeout(loaderTimer);
  }, [isLoading]);

  const role = currentUser.rest.role;

  const location = useLocation();
  const clientId = location.state?.clientId;

  const {
    data: clientpayments = { data: [] },
    isError: ispaymentError,
    refetch,
  } = useFetchSingleClientPaymentsQuery(clientId);

  // get single register client
  const singleClientInfo = wholesaleClients.data.find(
    (client) => client.bulkBuyerId === clientId
  );

  const clientAllSales = [...clientSales.data].filter(
    (sale) => sale.bulkBuyerId == clientId && sale.saleStatus !== "CANCELED"
  );

  // DATAGRID ROWS AND COLUMNS FOR PAYMENTS TABLE
  const paymentsRows = [...clientpayments.data]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((pay) => ({
      id: pay.paymentId,
      col1: pay.receiptNumber,
      col2: pay.paymentAmount,
      col3: formatDateTime(pay.paymentDate),
    }));

  const paymentsColumns = [
    { field: "col1", headerName: "Receipt Number", width: 200 },
    { field: "col2", headerName: "Paid Amount", width: 150 },
    { field: "col3", headerName: "Payment Date", width: 200 },
    {
      field: "col4",
      headerName: "View Receipt",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          <button
            variant="contained"
            color="primary"
            className="bg-blue-800 flex rounded-full h-6 items-center px-4 text-[0.85rem]"
            onClick={() => handlePaymentRecpt(params.row.id)}
          >
            Pay Receipt
          </button>
        </div>
      ),
    },
  ];

  const handlePaymentRecpt = (id) => {
    const selectPayment = [...clientpayments.data].find(
      (payment) => payment.paymentId === id
    );

    const amountToPay = selectPayment.paymentAmount;
    const receiptNumber = selectPayment.receiptNumber;
    const createdAt = selectPayment.paymentDate;

    payReceiptPDF(
      singleClientInfo.companyName,
      amountToPay,
      receiptNumber,
      createdAt
    );
  };

  // DATA GRID ROWS COLUMNS
  const rows = clientAllSales
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((sale) => ({
      id: sale.saleId,
      col1: sale.invoiceNumber,
      // col2: sale.buyerName,
      // col3: sale.phoneNumber,
      col4: sale.totalAmount,
      col5: sale.discount,
      col6: sale.totalAmount - sale.discount,
      col7: sale.paidAmount,
      col8: sale.paymentStatus,
      col9: sale.user?.name || sale.cashierName || "N/A",
      col10: sale.saleStatus,
      col11: formatDateTime(sale.createdAt),
    }));

  const columns = [
    { field: "col1", headerName: "Invoice Number", width: 200 },
    // { field: "col2", headerName: "Customer", width: 150 },
    // { field: "col3", headerName: "Phone Number", width: 150 },
    { field: "col4", headerName: "Amount", width: 120 },
    { field: "col5", headerName: "Discount", width: 100 },
    { field: "col6", headerName: "Total", width: 100 },
    { field: "col7", headerName: "Paid", width: 120 },
    {
      field: "col8",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center  h-full">
          <button
            variant="contained"
            color="primary"
            className={`bg-blue-800 flex rounded-full h-[22px] pt-0.5 items-center px-3 text-[11px] font-bold leading-none ${
              params.value === "FULL PAID"
                ? "bg-green-700"
                : params.value === "UNPAID"
                ? "bg-red-700"
                : "bg-orange-600"
            }`}
          >
            {params.value}
          </button>
        </div>
      ),
    },
    { field: "col9", headerName: "Cashier", width: 150 },
    {
      field: "col10",
      headerName: "Sale Status",
      width: 180,
      renderCell: (params) => (
        <div className="flex items-center  h-full">
          <button
            variant="contained"
            color="primary"
            className={`flex rounded-full h-[22px] pt-0.5 items-center px-3 text-[11px] font-semibold leading-none ${
              params.value === "COMPLETED"
                ? "bg-fuchsia-700"
                : params.value === "HALF_RETURNED"
                ? "bg-amber-600"
                : "bg-[#FF3F80]"
            }`}
          >
            {params.value}
          </button>
        </div>
      ),
    },
    { field: "col11", headerName: "Created At", width: 200 },
    {
      field: "col12",
      headerName: "Invoice",
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          <button
            variant="contained"
            color="primary"
            className="bg-blue-800 flex rounded-full h-6 items-center px-3"
            onClick={() => handleInvoice(params.row.id)}
          >
            Invoice
          </button>
        </div>
      ),
    },
  ];

  const handleInvoice = (saleId) => {
    const selectSaleRecord = clientAllSales.find(
      (sale) => sale.saleId === saleId
    );

    const invoiceItems = selectSaleRecord.SalesItem.map((item) => ({
      sku: item.product.sku,
      name: item.product.name,
      warrantyPeriod: item.warrantyPeriod
        ? item.warrantyPeriod
        : item.product.warrantyPeriod,
      cartQuantity: item.quantity,
      price: item.price,
    }));

    const total = parseFloat(selectSaleRecord.totalAmount);
    const currentUserName =
      selectSaleRecord.user?.name || selectSaleRecord.cashierName || "N/A";
    const billingName = selectSaleRecord.buyerName;
    const phoneNumber = selectSaleRecord.phoneNumber;
    const discount = selectSaleRecord.discount;
    const serviceCharge = selectSaleRecord.serviceCharge;
    const grandTotal = total - discount + Number(serviceCharge);
    const paidAmount = selectSaleRecord.paidAmount;
    const invoiceNumber = selectSaleRecord.invoiceNumber;

    const serviceDesc = selectSaleRecord.serviceDescription;
    const createdAt = selectSaleRecord.createdAt;

    generatePDF(
      invoiceItems,
      total,
      currentUserName,
      billingName,
      phoneNumber,
      null,
      discount,
      grandTotal,
      paidAmount,
      invoiceNumber,
      serviceCharge,
      serviceDesc,
      createdAt,
      currentStoreAddress
    );
  };

  const handlePaymentSubmission = async (amountToPay) => {
    try {
      const res = await axios.post(
        `${apiUrl}/payment/create`,
        {
          bulkBuyerId: clientId,
          payAmount: amountToPay,
          storeId: selectedStoreId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (!res.data.success) {
        showErrorToast("Payment added failed!");
      }

      if (res.data.success) {
        let receiptNumber = res.data.payment.receiptNumber;

        payReceiptPDF(singleClientInfo.companyName, amountToPay, receiptNumber);

        showSuccessToast("Payment added successfully!");
      } else {
        showErrorToast("Payment added failed. please try again later.");
      }

      refetch();
      refetchWholesaleClients();
    } catch (error) {
      console.log(error);

      showErrorToast("Payment added & sale record update failed!");
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

  const ClientInfoBox = ({ title, value, outstanding }) => {
    return (
      <div>
        <p className="text-slate-300 uppercase text-[0.8rem]">{title}</p>
        <p
          className={`${
            outstanding
              ? "text-[1.5rem] sm:text-[1.8rem] text-slate-200 font-medium"
              : "text-[1.5rem] sm:text-[1.7rem]"
          } text-blue-300`}
        >
          {value}
        </p>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="px-4 md:px-8 py-6 flex flex-col border-slate-700 rounded-md border min-h-[800px]">
        {/* Header bar */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Client Info</h1>
          {/* {role == "ADMIN" && ( */}
          <button
            className="flex items-center bg-blue-700 hover:bg-blue-700 text-gray-200 font-normal py-2 px-3 rounded-md text-md"
            onClick={() => setIsPayModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Make a Payment
          </button>
          {/* )} */}
        </div>

        {showLoader || isLoading ? (
          renderTableSkeleton()
        ) : (
          <>
            <div className="w-full border-slate-700 flex items-center justify-between gap-10 bg-[#1b253b] py-4 px-6 rounded-md flex-wrap">
              <div className="flex items-center gap-10 flex-wrap">
                <ClientInfoBox title="name" value={singleClientInfo.name} />
                <ClientInfoBox
                  title="telephone"
                  value={singleClientInfo.phoneNumber}
                />
                <ClientInfoBox
                  title="Company Name"
                  value={singleClientInfo.companyName}
                />
                <ClientInfoBox title="Email" value={singleClientInfo.email} />
              </div>
              <div>
                <ClientInfoBox
                  title="outstanding Balance"
                  value={singleClientInfo.outstandingBalance.toFixed(2)}
                  outstanding={true}
                />
              </div>
            </div>
            {/* tab box */}
            <div className="tabs-wrap mt-4">
              <div className="flex items-center border-b border-slate-700 gap-4">
                <button
                  onClick={() => setActiveTab("PAYMENT")}
                  className={`py-2 px-4 rounded-sm   text-slate-200 text-[0.95rem] ${
                    activeTab === "PAYMENT"
                      ? "!border-b-4  border-blue-500 !text-blue-300 font-medium"
                      : " text-gray-500"
                  }`}
                >
                  Payments
                </button>
                <button
                  onClick={() => setActiveTab("SALES")}
                  className={`py-2 px-2 rounded-sm   ${
                    activeTab === "SALES"
                      ? "border-b-4 border-blue-500 !text-blue-300 font-medium"
                      : "text-slate-200"
                  }`}
                >
                  Sales
                </button>
              </div>
              {/* Tab Content */}
              <div className="mt-4 relative w-full">
                {activeTab === "PAYMENT" && (
                  <div
                    className={`transition-opacity duration-500 ease-in-out w-full ${
                      activeTab === "PAYMENT"
                        ? "opacity-100"
                        : "opacity-0 absolute"
                    } `}
                  >
                    <div>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "800px",
                          height: "550px",
                        }}
                        className="mt-8"
                      >
                        <Suspense
                          fallback={<CircularProgress color="primary" />}
                        >
                          <DataGrid
                            rows={paymentsRows}
                            columns={paymentsColumns}
                            className="text-white! rounded-lg border !border-gray-400 !text-gray-200"
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
                            }}
                            // pagination={true}
                            // paginationMode="server"
                            // rowCount={paginatedSales.total || 0}
                            // paginationModel={paginationModel}
                            // onPaginationModelChange={(newModel) =>
                            //   setPaginationModel(newModel)
                            // }
                            // loading={isPaginatedSaleLoading}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "SALES" && (
                  <div
                    className={`transition-opacity duration-500 ease-in-out ${
                      activeTab === "SALES"
                        ? "opacity-100"
                        : "opacity-0 absolute"
                    }`}
                  >
                    <div>
                      {/* sales table */}
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "fit-content",
                          height: "600px",
                        }}
                        className="mt-8"
                      >
                        <Suspense
                          fallback={<CircularProgress color="primary" />}
                        >
                          <DataGrid
                            rows={rows}
                            columns={columns}
                            className="text-white! rounded-lg border !border-gray-400 !text-gray-200"
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
                            }}
                          />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* tab end */}
            {/* Pay Modal */}
            <DuePayModal
              isOpen={isPayModalOpen}
              onClose={() => setIsPayModalOpen(false)}
              outstandingBalance={singleClientInfo.outstandingBalance}
              onCreate={handlePaymentSubmission}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default MoreClientInfo;
