import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { updateStock } from '../../../server/controllers/stockController';

const apiUrl = import.meta.env.VITE_API_URL;

const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: apiUrl, credentials: 'include', }),
    tagTypes: ['Products', 'Sales', 'Categories', 'WholesaleClients', 'Users', 'Payments', 'Stores', 'Stocks'],
    endpoints: (builder) => ({

        // Products EndPoints
        fetchProducts: builder.query({
            query: () => '/products/getproducts',
            providesTags: ['Products']
        }),

        fetchPaginatedProducts: builder.query({
            query: ({ page = 0, limit = 20, searchTerm = '', storeId }) => `/products/getpaginationProducts?page=${page}&limit=${limit}&searchTerm=${searchTerm}&storeId=${storeId}`,
            providesTags: ['Products']
        }),

        fetchFilteredPaginatedProducts: builder.query({
            query: ({ category, search, page = 0, limit = 20, storeId }) => {
                const params = new URLSearchParams({
                    ...(category && { category }),
                    ...(search && { search }),
                    page: page.toString(),
                    limit: limit.toString(),
                    storeId: storeId.toString()
                });
                return `/products/getfilteredPaginatedProducts?${params.toString()}`;

            },
            providesTags: ['Products']
        }),


        createProduct: builder.mutation({
            query: (formData) => ({
                url: '/products/add',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: formData,

            }),
            invalidatesTags: ['Products']
        }),
        deleteProduct: builder.mutation({
            query: ({id, selectedStoreId}) => ({
                url: `/products/delete/${id}`,
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['Products']

        }),
        updateProduct: builder.mutation({
            query: ({ id, updatedData, selectedStoreId }) => ({
                url: `/products/updateproduct/${id}?storeId=${selectedStoreId}`,
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: updatedData
            }),
            invalidatesTags: ['Products']
        }),

        // Category Endpoints
        fetchCategories: builder.query({
            query: () => '/category/getCategories',
            providesTags: ['Categories']
        }),
        fetchFilteredCategories: builder.query({
            query: ({ searchTerm = '' }) => {
                const params = new URLSearchParams({ searchTerm });
                return `/category/getFilteredCategories?${params.toString()}`;
            },
            providesTags: ['Categories']
        }),
        createCategory: builder.mutation({
            query: (formData) => ({
                url: '/category/add',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Categories']
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/category/deleteCategory/${id}`,
                method: 'DELETE',

            }),
            invalidatesTags: ['Categories']
        }),
        updateCategory: builder.mutation({
            query: ({ id, data }) => ({
                url: `/category/updateCategory/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['Categories']
        }),


        // Sales Endpoints
        fetchSales: builder.query({
            query: ({ storeId }) => `/sales/getSales?storeId=${storeId}`,
            providesTags: ['Sales']
        }),

        fetchPaginatedSales: builder.query({
            query: ({ page = 0, limit = 50, searchTerm = "", storeId }) => `/sales/getpaginationSales?page=${page}&limit=${limit}&searchTerm=${searchTerm}&storeId=${storeId}`,
            providesTags: ['Sales']
        }),

        fetchDueSales: builder.query({
            query: ({ searchTerm = "", storeId }) => `/sales/getDueSales?searchTerm=${searchTerm}&storeId=${storeId}`,
            porvidesTags: ['Sales']
        }),

        fetchReturnCancelSales: builder.query({
            query: ({ searchTerm, storeId }) => `/sales/getReturnCancel?searchTerm=${searchTerm}&storeId=${storeId}`,
            providesTags: ['Sales']
        }),

        cancelSaleRecord: builder.mutation({
            query: (formData) => ({
                url: `/sales/cancelSale`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: formData
            }),
            invalidatesTags: ['Sales']
        }),
        fetchRecent14DaySales: builder.query({
            query: ({ storeId }) => `/sales/recent14DaySales?storeId=${storeId}`,
            providesTags: ['Sales']
        }),

        // Wholesale clients Endpoints
        fetchWholesaleClients: builder.query({
            query: ({ searchTerm = "" }) => `/wholesaleClient/getBulkBuyers?searchTerm=${searchTerm}`,
            providesTags: ['WholesaleClients']
        }),
        createWholesaleClient: builder.mutation({
            query: (formData) => ({
                url: '/wholesaleClient/add',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: formData
            }),
            invalidatesTags: ['WholesaleClients']
        }),
        deleteWholesaleClient: builder.mutation({
            query: ({id}) => ({
                url: `/wholesaleClient/delete/${id}`,
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['WholesaleClients']

        }),
        updateWholesaleClient: builder.mutation({
            query: ({ id, updatedData }) => ({
                url: `/wholesaleClient/update/${id}`,
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: updatedData
            }),
            invalidatesTags: ['WholesaleClients']
        }),


        // Users Endpoints
        fetchUsers: builder.query({
            query: ({ storeId }) => `/user/getusers?storeId=${storeId}`,
            providesTags: ['Users']

        }),
        createUser: builder.mutation({
            query: (formData) => ({
                url: '/auth/signup',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: formData
            }),
            invalidatesTags: ['Users']
        }),
        deleteUser: builder.mutation({
            query: ({id}) => ({
                url: `/user/deleteuser/${id}`,
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['Users']

        }),
        updateUser: builder.mutation({
            query: ({ id, updatedData }) => ({
                url: `/user/updateuser/${id}`,
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: updatedData
            }),
            invalidatesTags: ['Users']
        }),

        updateUserAccount: builder.mutation({
            query: (updatedData) => ({
                url: `/user/updateUserAccount/`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: updatedData
            }),
            invalidatesTags: ['Users']
        }),


        // Payments Endpoints
        fetchSingleClientPayments: builder.query({
            query: (id) => `payment/getPayments/${id}`,
            providesTags: ['Payments']

        }),

        // Store Endpoints
        fetchStores: builder.query({
            query: () => '/stores/',
            providesTags: ['Stores']

        }),

        createStore: builder.mutation({
            query: (formData) => ({
                url: '/stores/create',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: formData
            }),
            invalidatesTags: ['Stores']
        }),

        updateStore: builder.mutation({
            query: ({ id, updatedData }) => ({
                url: `/stores/update/${id}`,
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: updatedData
            }),
            invalidatesTags: ['Stores']
        }),

        deleteStore: builder.mutation({
            query: ({id}) => ({
                url: `/stores/delete/${id}`,
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            }),
            invalidatesTags: ['Stores']

        }),

        // Dashboard Data Endpoints
        fetchTotalRevenue: builder.query({
            query: ({ storeId }) => `/sales/getTotalRevenue/${storeId}`,
            providesTags: ['Sales', 'Payments']
        }),

        fetchMonthlyRevenue: builder.query({
            query: ({ storeId }) => `/sales/getMonthlyRevenue/${storeId}`,
            providesTags: ['Sales', 'Payments']
        }),

        fetchDailyRevenue: builder.query({
            query: ({ storeId }) => `/sales/getDailyRevenue/${storeId}`,
            providesTags: ['Sales', 'Payments']
        }),

        fetchTotalSales: builder.query({
            query: ({ storeId }) => `/sales/getTotalSales/${storeId}`,
            providesTags: ['Sales', 'Payments']
        }),

        fetchMonthlySaleCount: builder.query({
            query: ({ storeId }) => `/sales/getMonthlySaleCount/${storeId}`,
            providesTags: ['Sales', 'Payments']
        }),

        // Stock Endpoints
        fetchStocks: builder.query({
            query: ({ page = 0, limit = 20, searchTerm = '', storeId }) => `/stocks?page=${page}&limit=${limit}&searchTerm=${searchTerm}&storeId=${storeId}`,
            providesTags: ['Stocks']
        }),

        createStock: builder.mutation({
            query: (formData) => ({
                url: '/stocks/create',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: formData,

            }),
            invalidatesTags: ['Stocks']
        }),

        updateStock: builder.mutation({
            query: ({ id, updatedData, selectedStoreId }) => ({
                url: `/stocks/update`,
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: {
                    id,
                    storeId: selectedStoreId,
                    quantity: updatedData,
                },
            }),
            invalidatesTags: ["Stocks", "Products"]
        }),

        deleteStock: builder.mutation({
            query: ({ id, selectedStoreId }) => ({
                url: `/stocks/delete/${id}`,
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    storeId: selectedStoreId
                }
            }),
            invalidatesTags: ['Stocks']

        }),



    })
});

export const { useFetchProductsQuery, useFetchPaginatedProductsQuery, useFetchFilteredPaginatedProductsQuery, useCreateProductMutation, useDeleteProductMutation, useUpdateProductMutation, useFetchCategoriesQuery, useFetchFilteredCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation, useFetchSalesQuery, useFetchPaginatedSalesQuery, useFetchDueSalesQuery, useFetchReturnCancelSalesQuery, useCancelSaleRecordMutation, useFetchRecent14DaySalesQuery, useFetchWholesaleClientsQuery, useCreateWholesaleClientMutation, useDeleteWholesaleClientMutation, useUpdateWholesaleClientMutation, useFetchUsersQuery, useCreateUserMutation, useDeleteUserMutation, useUpdateUserMutation, useUpdateUserAccountMutation, useCheckSetupStatusQuery, useFetchSingleClientPaymentsQuery, useFetchStoresQuery, useCreateStoreMutation, useUpdateStoreMutation, useDeleteStoreMutation, useFetchTotalRevenueQuery, useFetchMonthlyRevenueQuery, useFetchDailyRevenueQuery, useFetchTotalSalesQuery, useFetchMonthlySaleCountQuery, useFetchStocksQuery, useCreateStockMutation, useUpdateStockMutation, useDeleteStockMutation } = apiSlice;
export default apiSlice;