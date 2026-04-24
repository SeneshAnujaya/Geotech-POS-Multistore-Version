import React, { useEffect, useState } from "react";
import { showErrorToast } from "./ToastNotification";
import { useDispatch, useSelector } from "react-redux";
import { fetchWholesaleClients } from "../redux/wholesaleclients/wholesaleclientSlice";
import { useFetchWholesaleClientsQuery } from "../redux/apiSlice";
import { CircleCheckBig, Coins, CreditCard } from "lucide-react";

const SaleconfirmModal = ({
  isOpen,
  onClose,
  onCreate,
  isBulkBuyer,
  total,
}) => {
  const {
    data: wholesaleClients = { data: [] },
    error,
    isLoading,
  } = useFetchWholesaleClientsQuery({
    // refetchOnMountOrArgChange: true
  });

  const [isCredit, setIsCredit] = useState(false);

  const dispatch = useDispatch();

  const [grandTotal, setGrandTotal] = useState(total);

  const [serviceChgShow, setServiceChgShow] = useState(false);
  const [namePrefix, setNamePrefix] = useState("Mr");

  const [formData, setFormData] = useState({
    clientName: "",
    phonenumber: "",
    discount: 0,
    // paidAmount: isBulkBuyer ? grandTotal : grandTotal,
    paidAmount: isCredit ? "" : grandTotal,
    selectedClientId: null,
    serviceDesc: "",
    serviceCharge: 0,
  });

  useEffect(() => {
    const newTotal = (total - formData.discount).toFixed(2);
    let totalWithServChg = Number(newTotal) + Number(formData.serviceCharge);

    const updatedGrandTotal =
      totalWithServChg >= 0 ? parseFloat(totalWithServChg) : 0;
    setGrandTotal(updatedGrandTotal);
  }, [
    formData.discount,
    formData.serviceCharge,
    serviceChgShow,
    total,
    isBulkBuyer,
  ]);

  useEffect(() => {
    if (isCredit) {
      setFormData((prevData) => ({ ...prevData, paidAmount: "" }));
    } else {
      setFormData((prevData) => ({ ...prevData, paidAmount: grandTotal }));
    }
  }, [isBulkBuyer, isCredit, grandTotal, total]);

  useEffect(() => {
    if (!isOpen) {
      // Reset fields when the modal is closed
      setFormData((prev) => ({
        ...prev,
        serviceCharge: 0,
        serviceDesc: "",
      }));
      setServiceChgShow(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.clientName || !formData.phonenumber) {
      showErrorToast("Please fill in all required fields.");
      return;
    }

    // Validate select box when the sale is for a bulk buyer
    if (isCredit && !formData.selectedClientId) {
      showErrorToast("Please select a registered customer.");
      return;
    }

    if (isCredit && formData.paidAmount == "") {
      showErrorToast("Paid amount cannot be empty.");
      return;
    }

    if (isCredit && formData.paidAmount > grandTotal) {
      showErrorToast("Paid amount cannot exceed the total.");
      return;
    }

    if (isCredit && formData.paidAmount < 0) {
      showErrorToast("Paid amount cannot be negative.");
      return;
    }

    if (Number(formData.discount) > Number(total)) {
      showErrorToast("Discount cannot exceed the total amount.");
      return;
    }

    if (formData.serviceCharge > 0 && formData.serviceDesc == "") {
      showErrorToast("Service Description Required!");
      return;
    }

    const dataToSubmit = {
      ...formData,
      clientName: `${namePrefix} ${formData.clientName}`.trim(),
      grandTotal,
      selectedClientId: formData.selectedClientId
        ? formData.selectedClientId
        : null,
    };

    onCreate(dataToSubmit);

    setFormData({
      clientName: "",
      phonenumber: "",
      discount: 0,
      // paidAmount: isBulkBuyer ? grandTotal : total,
      paidAmount: isCredit ? "" : total, // Reset to default based on isBulkBuyer
      selectedClientId: null,
      serviceDesc: "",
      serviceCharge: 0,
    });

    setNamePrefix("Mr");
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleClientSelectChange = (e) => {
    const selectedClientId = e.target.value;
    const selectedClient = wholesaleClients.data.find((client) => {
      return client.bulkBuyerId === selectedClientId;
    });

    setFormData({
      ...formData,
      selectedClientId,
      clientName: selectedClient ? selectedClient.name : "",
      phonenumber: selectedClient ? selectedClient.phoneNumber : "",
    });
  };

  const resetClientDetails = () => {
    setFormData((prevData) => ({
      ...prevData,
      clientName: "",
      phonenumber: "",
      selectedClientId: null,
    }));
  };

  useEffect(() => {
    if (isBulkBuyer || isCredit) {
      resetClientDetails();
    }
  }, [isBulkBuyer, isCredit]);

  // Handle payment type
  const handlePaymentMethod = (e) => {
    const isCreditSelected = e.target.value === "credit";
    setIsCredit(isCreditSelected);

    if (!isCreditSelected) {
      resetClientDetails();
    }
  };

  const handlePrefixChange = (e) => {
    setNamePrefix(e.target.value);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-950 bg-opacity-40 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-7 border border-slate-600  max-w-md  shadow-lg rounded-md  bg-[#121f4b]">
        <h1 className="text-[1.3rem] font-semibold text-slate-300">
          {!isBulkBuyer ? "Regular" : "Wholesale"} Bill Information
        </h1>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="pay-method"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Select Payment Method
          </label>
          {/* payment switch */}
          <div className="mt-4 mb-6 flex gap-5 items-center w-full">
            <label
              className={`text-slate-300 items-center gap-2 flex text-[0.85rem] font-medium border py-2 px-3 rounded-md   border-slate-500 cursor-pointer ${
                !isCredit ? "bg-blue-600 !border-blue-800" : "bg-transparent"
              }`}
            >
              <Coins className="w-6 h-6" />
              CASH
              <input
                type="radio"
                value="cash"
                checked={!isCredit}
                className="appearance-none h-2.5 w-2.5 rounded-full border border-gray-300 checked:bg-green-500 checked:border-transparent focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-green-500  cursor-pointer"
                onChange={handlePaymentMethod}
              />
            </label>
            <label
              className={`text-slate-300 items-center gap-2 flex text-[0.85rem] font-medium  border py-2 px-3 rounded-md border-slate-500 cursor-pointer ${
                isCredit ? "bg-blue-800 !border-blue-800" : "bg-transparent"
              }`}
            >
              <CreditCard className="w-6 h-6" />
              CREDIT
              <input
                type="radio"
                value="credit"
                checked={isCredit}
                className="appearance-none h-2.5 w-2.5 rounded-full border border-gray-300 checked:bg-green-500 checked:border-transparent focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-green-500 cursor-pointer"
                onChange={handlePaymentMethod}
              />
            </label>
          </div>

          {/* {isCredit && ( */}
          <>
            <label
              htmlFor="wholesaleClient"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Select Registered Customer
            </label>
            <select
              className={`w-full p-2 rounded-md text-slate-800 outline-none   ${
                formData.selectedClientId ? "border-4 border-green-500" : ""
              }`}
              onChange={handleClientSelectChange}
              value={formData.selectedClientId || ""}
            >
              <option value="">Select a client...</option>
              {wholesaleClients.data
                .filter((client) =>
                  isBulkBuyer
                    ? client.type === "BULK"
                    : client.type === "REGULAR"
                )
                .map((client) => {
                  return (
                    <option key={client.bulkBuyerId} value={client.bulkBuyerId}>
                      {client.companyName}
                    </option>
                  );
                })}
            </select>
          </>
          {/* )} */}

          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-1 mt-2"
          >
            Customer Name
          </label>
          <div className="flex items-center gap-2">
            <select
              value={namePrefix}
              onChange={handlePrefixChange}
              className="block  mb-2 py-2 border-gray-600 border rounded-md text-gray-900 w-14"
            >
              <option value="Mr">Mr</option>
              <option value="Miss">Miss</option>
            </select>
            <input
              type="text"
              name="clientName"
              placeholder="Customer Name..."
              value={formData.clientName}
              className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
              onChange={handleChange}
            />
          </div>
          <label
            htmlFor="phonenumber"
            className="block text-sm font-medium text-gray-300"
          >
            Phone Number
          </label>
          <input
            type="text"
            name="phonenumber"
            placeholder="Phone Number..."
            value={formData.phonenumber}
            className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
            onChange={handleChange}
          />

          

          {!isBulkBuyer && (
            <>
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-300 mt-2"
              >
                Discount
              </label>
              <input
                type="number"
                name="discount"
                placeholder="Enter Discount..."
                value={formData.discount}
                className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
                onChange={handleChange}
                min="0"
              />
            </>
          )}

          {isCredit && (
            <>
              <label
                htmlFor="paidAmount"
                className="block text-sm font-medium text-gray-300 mt-2"
              >
                Paid Amount
              </label>
              <input
                type="number"
                name="paidAmount"
                placeholder="Enter Paid Amount..."
                value={formData.paidAmount}
                className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900"
                onChange={handleChange}
              />
            </>
          )}

          {!isBulkBuyer && (
            <button
              onClick={() => setServiceChgShow(!serviceChgShow)}
              type="button"
              className={`${
                serviceChgShow
                  ? "bg-blue-600 !border-blue-600"
                  : "bg-transparent"
              } mt-5 mb-3 flex  gap-2 border-slate-500 items-center py-1.5 px-3 rounded-full leading-none border text-[0.85rem]`}
            >
              Service Charge
              <CircleCheckBig
                className={`${serviceChgShow ? "block" : "hidden"} w-4 h-4`}
              />
            </button>
          )}

          {!isBulkBuyer && serviceChgShow && (
            <div className="transition-all">
              {/* <p className="mt-4 text-[0.95rem] text-slate-200">Fill if any service charge include:</p> */}
              <label
                htmlFor="serviceDesc"
                className="block text-sm font-medium text-gray-300 mt-2"
              >
                Service Description
              </label>
              <input
                type="text"
                name="serviceDesc"
                placeholder="Describe service shortly..."
                value={formData.serviceDesc}
                className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900 placeholder:text-gray-500"
                onChange={handleChange}
              />
              <label
                htmlFor="serviceCharge"
                className="block text-sm font-medium text-gray-300 mt-2"
              >
                Service charge
              </label>
              <input
                type="number"
                name="serviceCharge"
                placeholder="service charge..."
                value={formData.serviceCharge}
                className="block w-full mb-2 p-2 border-gray-600 border rounded-md text-gray-900 placeholder:text-gray-500"
                onChange={handleChange}
                min={0}
              />
            </div>
          )}

          <p className="text-[0.95rem] text-slate-200 font-semibold mt-6">
            Payment Summary
          </p>
          {!isBulkBuyer && (
            <div className="flex justify-between items-center gap-2 mt-2">
              <p className="text-slate-300 text-[0.95rem]">Discount</p>
              <p className="text-slate-300 text-[0.95rem]">
                {formData.discount ? formData.discount : 0.0}
              </p>
            </div>
          )}
          {isCredit && (
            <div className="flex justify-between items-center gap-2 mt-2">
              <p className="text-slate-300 text-[0.95rem]">Paid Amount</p>
              <p className="text-slate-300 text-[0.95rem]">
                {formData.paidAmount ? formData.paidAmount : 0.0}
              </p>
            </div>
          )}
          <div className="w-full h-px bg-slate-700 mt-3 mb-2"></div>
          <div className="flex justify-between items-center gap-2 mt-2">
            <p className="text-slate-200 font-semibold text-[1.05rem]">Total</p>
            <p className="text-slate-200 font-semibold text-[1.1rem]">
              LKR {grandTotal.toFixed(2)}
            </p>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full mt-2 py-2 px-2 bg-blue-600 text-white rounded hover:bg-green-700"
            >
              Print Invoice
            </button>
            <button
              onClick={onClose}
              type="button"
              className=" w-full mt-3 py-2 px-2 bg-transparent border border-slate-600 text-white rounded hover:bg-red-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleconfirmModal;
