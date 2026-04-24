import { ChartLine, ChartNoAxesCombined, CircleDollarSign } from "lucide-react";
import MainLayout from "../components/MainLayout";
import IconCard from "../components/IconCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { fetchSales } from "../redux/sales/saleSlice";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useFetchDailyRevenueQuery, useFetchMonthlyRevenueQuery, useFetchMonthlySaleCountQuery, useFetchRecent14DaySalesQuery, useFetchSalesQuery, useFetchTotalRevenueQuery, useFetchTotalSalesQuery } from "../redux/apiSlice";
import { formatDateTime } from "../dateUtil";

const apiUrl = import.meta.env.VITE_API_URL;

const getLast14DaysSales = (sales) => {
  const today = new Date();
  const past14Days = new Date(today);
  past14Days.setDate(today.getDate() - 58);

  return sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= past14Days && saleDate <= today;
  });
};

const aggregateSalesByDate = (sales) => {
  const salesByDate = {};

  sales.forEach((sale) => {
     const d = new Date(sale.createdAt);
    if(isNaN(d)) return;
    const saleDate = d.toISOString().slice(0, 10);
    const saleAmount = parseFloat(sale.paidAmount);

    if (!salesByDate[saleDate]) {
      salesByDate[saleDate] = 0;
    }

    salesByDate[saleDate] += saleAmount;
  });

  return Object.keys(salesByDate).map((date) => {
    const formattedDate = date.replace(/-/g, "/");
    return {
      date: formattedDate,
      amount: salesByDate[date],
    };
  });
};

const Dashboard = () => {

    // get selected storeID
  const selectedStoreId = useSelector((state) => state.store.selectedStoreId); 

  const {
    data: salesResponse = { data: [] },
    error,
    isLoading,
  } = useFetchSalesQuery({ storeId: selectedStoreId });
  const sales = salesResponse.data;
  const dispatch = useDispatch();
  const [salesData, setSalesData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [monthlySaleCount, setMonthlySaleCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);



  // get Dashboard data
  const {data: allTotalRevenue, isLoading: isTotalRevLoading} = useFetchTotalRevenueQuery({ storeId: selectedStoreId });
  const {data: monthlyRevenues, isLoading: isMonthlyRevLoading} = useFetchMonthlyRevenueQuery({storeId : selectedStoreId});
  const {data: dailyRevenues, isLoading: isDailyReveLoading} = useFetchDailyRevenueQuery({storeId : selectedStoreId});
  const {data: totalSaleCount, isLoading: isTotalSaleCountLoading} = useFetchTotalSalesQuery({storeId : selectedStoreId});
  const {data: monthlySalesCount, isLoading: isMonthlySalesCountLoading} = useFetchMonthlySaleCountQuery({storeId : selectedStoreId});

  // Get recent 14days Sales
  const { data: recent14DaysSales, isLoading: isRecent14DaysSalesLoading } = useFetchRecent14DaySalesQuery({ storeId: selectedStoreId });  

  useEffect(() => {
    const last14DaysSales = getLast14DaysSales(sales);
    const aggregatedData = aggregateSalesByDate(last14DaysSales);
    if (JSON.stringify(salesData) !== JSON.stringify(aggregatedData)) {
      setSalesData(aggregatedData);
    }
  }, [sales]);

  
  

  // Sales data for datagrid
  const rows = recent14DaysSales?.data
    // .sort(
    //   (a, b) =>
    //     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    // )
    // .slice(0, 15)
    .map((sale) => ({
      id: sale.saleId,
      col1: sale.invoiceNumber,
      col2: sale.buyerName,
      col3: sale.totalAmount,
      col4: sale.paidAmount,
      col5: sale.user?.name || sale.cashierName || "N/A",
      col6: sale.paymentStatus,
      col7: new Date(sale.createdAt),
    }));

  const columns = [
    { field: "col1", headerName: "Invoice Number", width: 150 },
    { field: "col2", headerName: "Customer", width: 130 },
    { field: "col3", headerName: "Total", width: 90 },
    { field: "col4", headerName: "Paid", width: 90 },
    { field: "col5", headerName: "Cashier", width: 100 },
    {
      field: "col6",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
          <button
            variant="contained"
            color="primary"
            className={`bg-blue-800 flex rounded-full h-[22px] pt-0.5 items-center px-3 text-[10px] font-bold leading-none ${
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

    {
      field: "col7",
      headerName: "Created At",
      width: 170,
      type: "date",
      valueFormatter: (params) => {
        const date = params;
        return date ? formatDateTime(date) : "N/A";
      },
    },
  ];

  const sortModel = [
    {
      field: "col7",
      sort: "desc",
    },
  ];

  return (
    <MainLayout>
      <div className="w-full min-h-[800px] border-slate-700 rounded-md border py-6 px-4 sm:px-6 ">
        <h1 className="text-xl sm:text-2xl font-medium">Dashboard</h1>
        <span className="mt-4 h-[1px] bg-slate-700 w-full block"></span>
        {/* Dashboard content goes here */}
        <div className="mt-4 flex flex-wrap  gap-4">
          <IconCard
            icon={<CircleDollarSign className="w-9 h-9 text-blue-400" />}
            // amount={Number(totalRevenue).toFixed(2)}
            amount={Number(allTotalRevenue?.totalRevenue ?? 0).toFixed(2) }
            title="Total Revenue"
            loading={isTotalRevLoading}
          />
          <IconCard
            icon={<CircleDollarSign className="w-9 h-9 text-blue-400" />}
            amount={Number(monthlyRevenues?.monthlyRevenue ?? 0).toFixed(2)}
            title="Monthly Revenue"
            loading={isMonthlyRevLoading}
          />
          <IconCard
            icon={<CircleDollarSign className="w-9 h-9 text-blue-400" />}
            amount={Number(dailyRevenues?.dailyRevenue ?? 0).toFixed(2)}
            title="Daily Revenue"
            loading={isDailyReveLoading}
          />

          <IconCard
            icon={<ChartNoAxesCombined className="w-9 h-9 text-blue-400" />}
            amount={totalSaleCount?.totalSalesCount ?? 0}
            title="Total Sales"
            loading={isTotalSaleCountLoading}
          />
          <IconCard
            icon={<ChartLine className="w-9 h-9 text-blue-400" />}
            amount={monthlySalesCount?.monthlySalesCount ?? 0}
            title="Monthly Sales"
            loading={isMonthlySalesCountLoading}
          />
        </div>
        {/* bottom row */}
        <div className="flex items-stretch h-auto gap-4 mt-8 flex-col xl:flex-row">
          <div className="w-full  sm:w-[100%] xl:w-[55%]  border-slate-700 rounded-md border py-6 px-4 sm:px-6">
            <h3 className="text-lg font-medium text-slate-200">Recent Sales</h3>
            <div
              style={{ width: "100%", height: "450px" }}
              className="mt-8 custom-scrollbar"
            >
              <DataGrid
                rows={rows}
                columns={columns}
                className="text-white! rounded-lg border !border-gray-400 !text-gray-200"
                sortModel={sortModel}
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
            </div>
          </div>
          <div className="w-full sm:flex-1 h-full  border-slate-700 rounded-md border py-4 px-4 sm:px-6 overflow-hidden">
            <h3 className="text-lg font-medium text-slate-200">Performance</h3>
            <ResponsiveContainer
              width="100%"
              height={465}
              className="mt-8 !h-[265px] sm:!h-full"
            >
              <BarChart
                data={salesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                {/* <CartesianGrid strokeDasharray="3 3"/> */}
                <XAxis dataKey="date" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip
                  cursor={{ fill: "rgba(96, 165, 250, 0.2)" }}
                  contentStyle={{
                    backgroundColor: "#162039",
                    borderRadius: "3px",
                    border: "1px solid #3f4b6b",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#aebddd", fontSize: "16px" }}
                  labelStyle={{
                    fontWeight: "normal",
                    color: "#f5f5f5",
                    fontSize: "15px",
                  }}
                />
                <Bar dataKey="amount" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
