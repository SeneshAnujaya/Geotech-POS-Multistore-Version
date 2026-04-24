import { useEffect, useMemo, useState } from "react";
import MainLayout from "../components/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  addItemToCart,
  increaseItemQuantity,
  decreaseItemQuantity,
  updateCartItemQuantity,
  clearCart,
  removeItemFromCart,
  updateWarrantyPeriod,
  setCustomPrice,
} from "../redux/cart/cartSlice";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MinusIcon,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../components/ToastNotification";
import axios from "axios";
import MouseImage from "../assets/mouse.jpg";
import generatePDF from "../components/generatePDF";
import SaleconfirmModal from "../components/SaleconfirmModal";
import {
  useFetchCategoriesQuery,
  useFetchDailyRevenueQuery,
  useFetchFilteredPaginatedProductsQuery,
  useFetchMonthlyRevenueQuery,
  useFetchMonthlySaleCountQuery,
  useFetchPaginatedProductsQuery,
  useFetchPaginatedSalesQuery,
  useFetchProductsQuery,
  useFetchSalesQuery,
  useFetchTotalRevenueQuery,
  useFetchTotalSalesQuery,
  useFetchWholesaleClientsQuery,
} from "../redux/apiSlice";
import Pagination from "../components/Pagination";
import PlaceholderImage from "../assets/place-holder-img.jpeg";

const apiUrl = import.meta.env.VITE_API_URL;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Orders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isBulkBuyer, setIsBulkBuyer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();

  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  const [page, setPage] = useState(0);
  const [limit] = useState(20);

  const {
    data: categories = { data: [] },
    error,
    isLoading: isCategoryLoading,
  } = useFetchCategoriesQuery(undefined, {
    // refetchOnMountOrArgChange: true,
  });

  const {
    data: products = { data: [] },
    error: isProductError,
    isLoading: isProductLoading,
    refetch,
  } = useFetchFilteredPaginatedProductsQuery({
    page,
    category: selectedCategory?.name,
    search: debouncedSearchTerm,
    limit: limit,
    storeId: selectedStoreId,
  }, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const productList = products?.products || [];

  const totalPages = Math.ceil(products.total / limit);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const { refetch: refetchSales } = useFetchSalesQuery(undefined, {});

  const { refetch: refetchWholesaleClients } = useFetchWholesaleClientsQuery({
    // refetchOnMountOrArgChange: true
  });

  const { refetch: refetchPaginatedSales } = useFetchPaginatedSalesQuery({
    page: 0,
    limit: 50,
    searchTerm: "",
    storeId: selectedStoreId
  });

  const { refetch: refetchPaginatedProducts } = useFetchPaginatedProductsQuery({
    page: 0,
    limit: 50,
    searchTerm: "",
    storeId: selectedStoreId,
  });

  // get Dashboard data
  const { refetch: refetchTotalRev } = useFetchTotalRevenueQuery({ storeId: selectedStoreId });
  const { refetch: refetchMonthlyRev } = useFetchMonthlyRevenueQuery({ storeId: selectedStoreId });
  const { refetch: refetchDailyRev } = useFetchDailyRevenueQuery({ storeId: selectedStoreId });
  const { refetch: refetchTotalSaleCount } = useFetchTotalSalesQuery({ storeId: selectedStoreId });
  const { refetch: refetchMonthlySaleCount } = useFetchMonthlySaleCountQuery({ storeId: selectedStoreId });

  const { cartItems } = useSelector((state) => state.cart);

  const { currentUser } = useSelector((state) => state.user);

  const currentUserName = currentUser.rest.name;
  const currentUserId = currentUser.rest.id;

  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Cart functionalities
  const handleAddToCart = (product) => {
    dispatch(
      addItemToCart({
        ...product,
        customPrice: isBulkBuyer ? product.wholesalePrice : product.retailPrice,
      })
    );
  };

  const isInCart = (sku) => {
    return cartItems.some((item) => item.sku === sku);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    showWarningToast("Clear the cart");
  };

  const handleRemoveItem = (sku) => {
    dispatch(removeItemFromCart({ sku }));
    showWarningToast("Remove the product");
  };

  const handleIncreaseQuantity = (sku) => {
    dispatch(increaseItemQuantity({ sku }));
  };

  const handleDecreaseQuantity = (sku) => {
    dispatch(decreaseItemQuantity({ sku }));
  };

  const handleManualQuantityChange = (sku, value) => {
    const newQuantity = parseInt(value, 10);

    if (!isNaN(newQuantity) && newQuantity > 0) {
      dispatch(updateCartItemQuantity({ sku, newQuantity }));
    }
  };

  // Handle custom warranty
  const handleCustomWarranty = (sku, warranty) => {
    dispatch(updateWarrantyPeriod({ sku, warrantyPeriod: warranty }));
  };

  // Handle custom price
  const handleCustomPrice = (sku, price) => {
    dispatch(setCustomPrice({ sku, price }));
  };

  // Handle Buyer Type
  const handleBuyerTypeChange = (e) => {
    setIsBulkBuyer(e.target.value === "wholesale");

    cartItems.forEach((item) => {
      dispatch(
        setCustomPrice({
          sku: item.sku,
          price:
            e.target.value === "wholesale"
              ? item.wholesalePrice
              : item.retailPrice,
        })
      );
    });
  };

  // Calculate Totals
  const { subTotal, total } = useMemo(() => {
    let subTotal = 0;
    cartItems.forEach((item) => {
      const price =
        item.customPrice !== null
          ? parseFloat(item.customPrice)
          : isBulkBuyer
            ? parseFloat(item.wholesalePrice)
            : parseFloat(item.retailPrice);

      subTotal += item.cartQuantity * price;
      // subTotal +=
      //   item.cartQuantity *
      //   (isBulkBuyer
      //     ? parseFloat(item.wholesalePrice)
      //     : parseFloat(item.retailPrice));
    });

    const total = subTotal;
    return {
      subTotal: subTotal.toFixed(2),
      total: total.toFixed(2),
    };
  }, [cartItems, isBulkBuyer]);

  const handleProceedCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      showWarningToast("Cart is empty");
      return;
    }

    const hasInvalidPrice = cartItems.some(
      (item) =>
        !item.customPrice ||
        isNaN(Number(item.customPrice)) ||
        item.customPrice === "" ||
        item.customPrice <= 0
    );

    if (hasInvalidPrice) {
      showWarningToast("products have an invalid price.");
      return;
    }

    setIsModalOpen(true);
  };

  const handlePrintInvoice = async (formData) => {
    const {
      clientName,
      phonenumber,
      discount,
      paidAmount,
      selectedClientId,
      grandTotal,
      serviceCharge,
      serviceDesc,
    } = formData;

    //  Sales record array
    const itemsToRecord = cartItems.map((item) => ({
      sku: item.sku,
      productId: item.productId,
      cartQuantity: item.cartQuantity,
      price:
        item.customPrice !== undefined
          ? parseFloat(item.customPrice)
          : isBulkBuyer
            ? parseFloat(item.wholesalePrice)
            : parseFloat(item.retailPrice),
      warrantyPeriod: item.warrantyPeriod,
    }));


    try {
      const res = await axios.post(
        `${apiUrl}/sales/createSaleRecordWithStockUpdate`,
        {
          userId: currentUserId,
          items: itemsToRecord,
          isBulkBuyer: isBulkBuyer,
          clientName,
          phoneNumber: phonenumber,
          discount: discount === "" ? 0 : discount,
          total,
          paidAmount,
          selectedClientId,
          grandTotal,
          currentUserName,
          serviceCharge,
          serviceDesc,
          storeId: selectedStoreId,
        }
      );

      if (res.status === 201 && res.data.success) {
        showSuccessToast("Sale and stock updated successfully!");

        const invoiceNumber = res.data.sale.invoiceNumber;

        generatePDF(
          cartItems.map((item) => ({
            ...item,
            price:
              item.customPrice !== undefined
                ? item.customPrice
                : isBulkBuyer
                  ? item.wholesalePrice
                  : item.retailPrice,
          })),
          total,
          currentUserName,
          clientName,
          phonenumber,
          dispatch,
          discount,
          grandTotal,
          paidAmount,
          invoiceNumber,
          serviceCharge,
          serviceDesc
        );

        refetchSales();
        refetchWholesaleClients();
        refetchPaginatedSales();
        refetchPaginatedProducts();
        refetch();

        refetchTotalRev();
        refetchMonthlyRev();
        refetchDailyRev();
        refetchTotalSaleCount();
        refetchMonthlySaleCount();
      } else {
        showErrorToast("Failed sale & update stock!");
      }
    } catch (error) {
      console.log(error);
      showErrorToast(`${error.response.data.message ? error.response.data.message : "Failed update stock & sale. Please try again."}`);
    }
  };

  return (
    <MainLayout>
      <div className="px-0 md:px-8 py-4 flex flex-col xl:flex-row gap-4 rounded-md">
        {/* Menu items side */}
        <div className="w-full xl:h-3/4 border border-slate-700 rounded-md bg-slate-900 p-4 min-h-[780px]">
          <div className="flex justify-between py-2 gap-4 flex-wrap">
            <div className=" items-center mb-6">
              <h1 className="text-xl md:text-3xl font-semibold">Orders</h1>
            </div>
            <div className="price-switch flex items-center justify-start gap-4 sm:gap-6 flex-wrap">
              {/* price switch */}
              <div className="mt-2.5 mb-3 flex gap-4 items-center">
                <label
                  className={`text-slate-300 text-[0.8rem] border py-1 px-2 rounded-full border-slate-500 cursor-pointer ${!isBulkBuyer
                      ? "bg-blue-800 !border-blue-800"
                      : "bg-transparent"
                    }`}
                >
                  <input
                    type="radio"
                    value="regular"
                    checked={!isBulkBuyer}
                    className="appearance-none h-3 w-3 rounded-full border border-gray-300 checked:bg-green-500 checked:border-transparent focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-green-500 mr-2 cursor-pointer"
                    onChange={handleBuyerTypeChange}
                  />
                  Regular
                </label>
                <label
                  className={`text-slate-300 text-[0.8rem] border py-1 px-2 rounded-full border-slate-500 cursor-pointer ${isBulkBuyer
                      ? "bg-blue-800 !border-blue-800"
                      : "bg-transparent"
                    }`}
                >
                  <input
                    type="radio"
                    value="wholesale"
                    checked={isBulkBuyer}
                    className="appearance-none h-3 w-3 rounded-full border border-gray-300 checked:bg-green-500 checked:border-transparent focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-green-500 mr-2 cursor-pointer"
                    onChange={handleBuyerTypeChange}
                  />
                  Wholesale
                </label>
              </div>
              {/* Search bar side */}
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search via SKU Name Brand."
                  className="w-full pl-10 pr-4 py-2 w-50 md:w-80 border border-slate-600 bg-slate-800 rounded-lg focus:outline-none focus:border-blue-500 "
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex  pointer-events-none">
                  <Search className="text-gray-500" size={20} />
                </div>
              </div>
            </div>
          </div>
          {/* Bottom list wrap */}
          <div className="mt-2 sm:mt-0">
            <h4 className="text-base font-normal text-slate-300">
              {/* Product Items {filteredProducts.length} */}
              Product Items {productList.length}
            </h4>
            <div className="flex flex-wrap gap-2 items-center mt-3">
              <div
                className={`leading-none py-2 px-4 rounded-full hover:cursor-pointer ${!selectedCategory
                    ? "bg-blue-600"
                    : "bg-slate-900 border-slate-600 border"
                  }`}
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(0);
                }}
              >
                All
              </div>
              {isCategoryLoading ? (
                <div>Loading...</div>
              ) : (
                categories.data.map((category) => (
                  <div
                    key={category.categoryId}
                    className={`leading-none   py-2 px-3 rounded-full  text-[0.93rem] hover:cursor-pointer ${selectedCategory &&
                        selectedCategory.categoryId === category.categoryId
                        ? "bg-blue-600"
                        : "bg-slate-900 border-slate-600 border"
                      }`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(0);
                    }}
                  >
                    {category.name}
                  </div>
                ))
              )}
            </div>

            {/* product items wrap */}
            <div className="flex flex-wrap  gap-4 mt-6 h-[500px] overflow-y-auto custom-scrollbar mb-6">
              {isProductLoading ? (
                <div className="mt-3 mb-2">Loading products...</div>
              ) : productList.length > 0 ? (
                productList.map((product) => (
                  <div
                    key={product.sku}
                    className="border bg-slate-900 border-slate-700 rounded-md p-4 w-full max-w-56 flex flex-col justify-between h-[310px]"
                  >
                    <img
                      src={
                        product.category.categoryPic
                          ? `${backendUrl}/uploads/${product.category.categoryPic}`
                          : PlaceholderImage
                      }
                      // src={`${apiUrl}/uploads/${product.category.categoryPic}`}
                      alt="product-pic"
                      className="w-full   rounded h-[120px] object-cover"
                    />
                    <h4 className="font-medium text-[0.95rem] mt-2 leading-5">
                      {product.name}
                    </h4>
                    <div className="flex gap-5 justify-between mt-2">
                      <p className="text-slate-300 text-[0.95rem]">
                        {product.category.name}
                      </p>
                      <p className="text-slate-300 text-[0.95rem]">
                        {/* LKR {parseFloat(product.retailPrice).toFixed(2)} */}
                        LKR
                        {isBulkBuyer
                          ? parseFloat(product.wholesalePrice).toFixed(2)
                          : parseFloat(product.retailPrice).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex mt-6 justify-between">
                      {isInCart(product.sku) ? (
                        <span
                          className="bg-blue-600 p-[4px] rounded-md hover:cursor-pointer"
                          onClick={() => removeItemFromCart(product.sku)}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </span>
                      ) : (
                        <span
                          className="bg-slate-700 p-[5px] rounded-md hover:cursor-pointer"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </span>
                      )}

                      <p
                        className={`leading-none text-[0.8rem] font-normal  flex items-center text-white bg-green-700 px-2 rounded-full ${product.quantity === 0
                            ? "bg-red-700"
                            : product.quantity < 5
                              ? "bg-orange-600"
                              : "bg-green-700"
                          }`}
                      >
                        {product.quantity} Stock
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="mt-4 text-slate-300">No products found !</div>
              )}
            </div>
            {/* Product Pagination controls */}
            <div className="flex gap-4 justify-between  flex-wrap">
              <p className="text-[0.9rem] text-slate-400">
                Showing {productList.length}/{products.total} results
              </p>
              <div className="flex gap-3">
                <button
                  className="h-min sm:h-auto py-1 px-2 rounded-md border border-slate-900 hover:border-slate-500  flex items-center text-[0.95rem] disabled:opacity-60"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  <span>
                    <ChevronLeft className="w-5 h-5" />
                  </span>
                </button>
                {/* page nubmers */}
                <div className="flex gap-2 flex-wrap">
                  {pages.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`py-1 px-3 rounded-md border text-[0.8rem] ${page + 1 === pageNumber
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-slate-700 hover:bg-blue-600 hover:text-white text-slate-200"
                        }`}
                      onClick={() => setPage(pageNumber - 1)} // Subtract 1 because pages are zero-indexed
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                <button
                  className="h-min sm:h-auto p-2 py-1 px-2 rounded-md border border-slate-900  hover:border-slate-500 flex items-center text-[0.95rem] disabled:opacity-60"
                  onClick={() => {
                    setPage(page + 1);
                  }}
                  disabled={page + 1 === totalPages}
                >
                  <span>
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* cart side */}
        <div className="w-full xl:w-1/4 border border-slate-700 rounded-md bg-slate-900 p-4 flex flex-col justify-between">
          <div>
            <h4 className="font-medium text-lg ">Order Detail</h4>
            {/*Cart items container*/}
            <div className="mt-2 flex justify-between items-center flex-wrap">
              <p className="text-[0.95rem] text-slate-300">
                {" "}
                Total items{" "}
                <span className="text-slate-200">{cartItems.length}</span>{" "}
              </p>
              <p
                className="text-[0.9rem] text-white bg-red-500 px-2 rounded-full hover:cursor-pointer"
                onClick={handleClearCart}
              >
                Clear All
              </p>
            </div>

            {/* cart product item */}
            <div className="h-[500px] overflow-auto mt-3 custom-scrollbar">
              {cartItems.map((item) => (
                <div
                  className="border mt-4 border-slate-700 rounded-md bg-slate-900 py-2 px-1.5 w-full"
                  key={item.sku}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-20">
                      <img
                        src={MouseImage}
                        alt="product-pic"
                        className="w-20 h-auto rounded-md"
                      />
                    </div>
                    <div className="w-full p-1">
                      <div className="flex justify-between min-w-full">
                        <div className=" min-w-50">
                          <h4 className="text-[0.9rem] text-slate-200 leading-tight">
                            {item.name}
                          </h4>
                          {/* <p className="text-[0.9rem] text-slate-300 mt-1">
                            LKR{" "}
                            {isBulkBuyer
                              ? parseFloat(item.wholesalePrice)
                              : parseFloat(item.retailPrice)}
                          </p> */}
                          {/* Custom Price */}
                          <div className="flex items-center gap-2  mt-2 flex-wrap">
                            <label className="text-[0.9rem] text-slate-300">
                              LKR{" "}
                            </label>
                            <input
                              type="text"
                              min="0"
                              name="custom-price"
                              className=" w-16 bg-slate-900 text-[0.9rem] px-1 border-slate-600 border rounded-[4px]  focus:border-blue-500 focus:outline-none"
                              value={item.customPrice}
                              // readOnly={!isEditingPrice}
                              // onFocus={() => setIsEditingPrice(true)}
                              // onBlur={() => {setIsEditingPrice(false); handleCustomPrice({sku: item.sku, price: customNewPrice})}}
                              onChange={(e) => {
                                const numericValue = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                handleCustomPrice(item.sku, numericValue);
                              }}
                            />
                            <span>
                              {/* <SquarePen className="w-5 text-slate-400 hover:text-blue-500 cursor-pointer"/> */}
                            </span>
                          </div>
                          {/* Custom warratny */}
                          <input
                            type="text"
                            name="custom-warranty"
                            className="mt-2 w-20 bg-slate-900 text-[0.9rem] px-1 border-slate-600 border rounded-[4px]"
                            value={item.warrantyPeriod}
                            onChange={(e) =>
                              handleCustomWarranty(item.sku, e.target.value)
                            }
                          />
                        </div>
                        <div className=" flex flex-col justify-between items-end">
                          <div
                            className="bg-slate-700 w-8 h-8 p-2 rounded-full hover:cursor-pointer"
                            onClick={() => handleRemoveItem(item.sku)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </div>

                          <div className="flex items-end justify-end w-full flex-wrap mt-2">
                            <div className=" flex items-center gap-1 rounded-md">
                              <button
                                onClick={() => handleDecreaseQuantity(item.sku)}
                                className="bg-slate-900 border border-slate-500 rounded-md p-[1px] hover:bg-blue-600 hover:border-blue-600"
                              >
                                <MinusIcon className="w-4 h-4 text-slate-200" />
                              </button>

                              <input
                                type="number"
                                value={item.cartQuantity}
                                className="w-7 bg-slate-900 border border-slate-500 rounded-[4px] focus:outline-none no-arrows text-center text-slate-300 text-[0.9rem]"
                                onChange={(e) =>
                                  handleManualQuantityChange(
                                    item.sku,
                                    e.target.value
                                  )
                                }
                                min="1"
                              />

                              <button
                                onClick={() => handleIncreaseQuantity(item.sku)}
                                className="border border-slate-500  rounded-md p-[1px] hover:bg-blue-600  hover:border-blue-600"
                              >
                                <Plus className="w-4 h-4 text-slate-200" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Payement summary */}
          <div className="border mt-4  border-slate-700 rounded-md bg-slate-900 p-4">
            <p className="text-[0.95rem] text-slate-200 font-semibold">
              Payment Summary
            </p>
            <div className="flex justify-between items-center gap-2 mt-3">
              <p className="text-slate-300 text-[0.9rem]">Sub Total</p>
              <p className="text-slate-300 text-[0.9rem]">
                LKR {isNaN(subTotal) ? 0 : subTotal}
              </p>
            </div>

            <div className="w-full h-px bg-slate-700 mt-3 mb-2"></div>
            <div className="flex justify-between items-center gap-2 mt-2">
              <p className="text-slate-200 font-semibold text-[0.92rem]">
                Total
              </p>
              <p className="text-slate-200 font-semibold text-[0.92rem]">
                LKR {isNaN(total) ? 0 : total}
              </p>
            </div>

            <button
              className="text-center w-full bg-blue-600 mt-4 py-2 px-2 rounded-md"
              onClick={handleProceedCheckout}
            >
              Proceed to checkout
            </button>

            {/* Sale Confirm Modal */}
            <SaleconfirmModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              isBulkBuyer={isBulkBuyer}
              onCreate={handlePrintInvoice}
              total={total}
            />
          </div>
        </div>
        {/* Header bar */}
      </div>
    </MainLayout>
  );
};

export default Orders;
