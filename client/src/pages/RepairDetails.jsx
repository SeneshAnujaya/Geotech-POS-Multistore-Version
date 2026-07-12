import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Loader2, Save, Printer, Receipt } from "lucide-react";

import MainLayout from "../components/MainLayout";
import {
  useFetchSingleRepairJobQuery,
  useUpdateRepairDetailsMutation,
  useCreateRepairInvoiceMutation,
  useAddRepairPartMutation,
  useReturnRepairPartMutation,
  useFetchStocksQuery,
} from "../redux/apiSlice";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";
import repairReceiptPDF from "../components/RepairReceiptPDF";
import repairInvoicePDF from "../components/RepairInvoicePDF";
import RepairInvoiceModal from "../components/RepairInvoiceModal";
import CustomSelect from "../components/CustomSelect";

const Card = ({ title, children, className = "" }) => (
  <div className={`rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm h-full ${className}`.trim()}>
    <h3 className="mb-4 text-sm font-semibold tracking-wide text-slate-300 uppercase">
      {title}
    </h3>

    {children}
  </div>
);

const Item = ({ label, value }) => (
  <div className="flex justify-between border-b border-slate-800 py-2 text-sm">
    <span className="text-slate-400">{label}</span>

    <span className="font-medium text-slate-100">{value || "-"}</span>
  </div>
);

const RepairDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const selectedStoreId = useSelector((state) => state.store.selectedStoreId);

  const [formData, setFormData] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [partQuantity, setPartQuantity] = useState(1);

  const { data, isLoading, isError } = useFetchSingleRepairJobQuery({
    repairJobId: id,
    storeId: selectedStoreId,
  });

  // Update Rtk Query
  const [updateRepairDetails, { isLoading: isSaving }] =
    useUpdateRepairDetailsMutation();
  const [createRepairInvoice, { isLoading: isCreatingInvoice }] =
    useCreateRepairInvoiceMutation();
  const [addRepairPart, { isLoading: isAddingPart }] =
    useAddRepairPartMutation();
  const [returnRepairPart, { isLoading: isReturningPart }] =
    useReturnRepairPartMutation();
  const { data: stockData } = useFetchStocksQuery(
    { page: 0, limit: 1000, searchTerm: "", storeId: selectedStoreId },
    { skip: !selectedStoreId },
  );

  const repair = data?.repair;

  useEffect(() => {
    if (!formData && repair) {
      setFormData(repair);
    }
  }, [repair]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      updated.totalCost =
        Number(updated.labourCost || 0) + Number(updated.partsCost || 0);

      return updated;
    });
  };

  // Edit save request
  const handleSave = async () => {
    try {
      const res = await updateRepairDetails({
        repairJobId: id,
        storeId: selectedStoreId,
        updatedData: formData,
      }).unwrap();

      if (res.success) {
        showSuccessToast("Repair updated successfully!");
      } else {
        showErrorToast(res.message);
      }
    } catch (error) {
      console.log(error);

      showErrorToast(error?.data?.message || "Failed to update repair.");
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      const response = await createRepairInvoice({
        repairJobId: id,
        storeId: selectedStoreId,
        ...invoiceData,
      }).unwrap();
      showSuccessToast("Repair invoice created and repair completed.");
      setIsInvoiceModalOpen(false);
      repairInvoicePDF({ ...response.invoice, repairJob: repair });
    } catch (error) {
      showErrorToast(
        error?.data?.message || "Failed to create repair invoice.",
      );
    }
  };

  const handleAddPart = async () => {
    if (!selectedPartId || Number(partQuantity) <= 0) {
      showErrorToast("Choose a stock item and quantity.");
      return;
    }
    try {
      await addRepairPart({
        repairJobId: id,
        storeId: selectedStoreId,
        productId: selectedPartId,
        quantity: Number(partQuantity),
      }).unwrap();
      setSelectedPartId("");
      setPartQuantity(1);
      showSuccessToast("Part added and stock deducted.");
    } catch (error) {
      showErrorToast(error?.data?.message || "Failed to add repair part.");
    }
  };

  const handleReturnPart = async (repairPartId) => {
    try {
      await returnRepairPart({
        repairJobId: id,
        repairPartId,
        storeId: selectedStoreId,
      }).unwrap();
      showSuccessToast("Part returned to stock.");
    } catch (error) {
      showErrorToast(error?.data?.message || "Failed to return part to stock.");
    }
  };

  const inputStyle =
    "w-full rounded border border-slate-800 bg-darkBlue px-3 py-2 text-sm text-slate-300 outline-none focus:border-blue-600";

  const textareaStyle = `${inputStyle} resize-none`;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !data?.repair) {
    return (
      <MainLayout>
        <div className="p-8 text-red-500">Failed to load repair.</div>
      </MainLayout>
    );
  }

  if (!formData) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      </MainLayout>
    );
  }

  const statusColor = {
    RECEIVED: "bg-purple-700",
    DIAGNOSING: "bg-yellow-600",
    REPAIRING: "bg-orange-600",
    READY: "bg-green-600",
    COMPLETED: "bg-emerald-700",
    CANCELLED: "bg-red-700",
  };
  const canChangeParts =
    !repair.repairInvoice &&
    !["COMPLETED", "CANCELLED"].includes(repair.status);
  const availableStocks =
    stockData?.data?.filter((stock) => stock.quantity > 0) || [];

  return (
    <MainLayout>
      <div className="space-y-5 p-6">
        {/* Header */}

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="mb-3 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <h1 className="text-3xl font-bold">{repair.jobNumber}</h1>

              <div className="mt-3 flex gap-4 text-sm text-blue-400">
                <span>
                  Created : {new Date(repair.createdAt).toLocaleDateString()}
                </span>

                <span>Store : {repair.store?.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold text-white ${
                  statusColor[repair.status]
                }`}
              >
                {repair.status}
              </span>

              {/* <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm hover:bg-green-700" onClick={handleSave}>
                <Save size={16} />
                Save Changes
              </button> */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm hover:bg-green-700 disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() =>
                  repair.intakeReceipt &&
                  repairReceiptPDF({
                    ...repair.intakeReceipt,
                    repairCreatedAt: repair.createdAt,
                  })
                }
                disabled={!repair.intakeReceipt}
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm hover:bg-blue-800 disabled:opacity-60"
              >
                <Printer size={16} />
                Receipt
              </button>

              {repair.repairInvoice ? (
                <button
                  onClick={() =>
                    repairInvoicePDF({
                      ...repair.repairInvoice,
                      repairJob: repair,
                    })
                  }
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm hover:bg-orange-700"
                >
                  <Receipt size={16} />
                  Invoice
                </button>
              ) : (
                <button
                  onClick={() => setIsInvoiceModalOpen(true)}
                  disabled={repair.status !== "READY"}
                  title={
                    repair.status !== "READY"
                      ? "Set the repair status to READY, save it, then create the invoice."
                      : "Create final repair invoice"
                  }
                  className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm hover:bg-orange-700 disabled:opacity-60"
                >
                  <Receipt size={16} />
                  Create Invoice
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top Grid */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Customer */}

          <Card title="Customer Details">
            <Item label="Customer" value={repair.customerName} />

            <Item label="Phone" value={repair.customerPhone} />
          </Card>

          {/* Device */}

          <Card title="Device Details">
            <Item label="Type" value={repair.deviceType} />

            <Item label="Brand" value={repair.brand} />

            <Item label="Model" value={repair.model} />

            <Item label="Serial" value={repair.serialNumber} />
          </Card>

          {/* Repair */}

          <Card title="Repair Information">
            {/* <Item label="Technician" value={repair.technician} /> */}
            <div className="mb-2">
              <input
                name="technician"
                value={formData?.technician || ""}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            {/* <Item label="Status" value={repair.status} /> */}
            <div className="mb-2">
              <select
                name="status"
                value={formData?.status}
                onChange={handleChange}
                className={inputStyle}
              >
                <option>RECEIVED</option>
                <option>DIAGNOSING</option>
                <option>REPAIRING</option>
                <option>READY</option>
                <option>CANCELLED</option>
              </select>
            </div>

            {/* <Item
              label="Delivery"
              value={
                repair.expectedDeliveryDate
                  ? new Date(repair.expectedDeliveryDate).toLocaleDateString()
                  : "-"
              }
            /> */}
            <div>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData?.expectedDeliveryDate?.substring(0, 10) || ""}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </Card>
        </div>

        {/* Full Width */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="grid gap-5">
            <Card title="Received Items">
              <textarea
                rows={3}
                name="receivedItems"
                value={formData?.receivedItems || ""}
                onChange={handleChange}
                className={textareaStyle}
              />
            </Card>

            <Card title="Physical Condition">
              <textarea
                rows={3}
                name="physicalCondition"
                value={formData?.physicalCondition || ""}
                onChange={handleChange}
                className={textareaStyle}
              />
            </Card>
          </div>

          <div className="grid gap-5">
            <Card title="Problem Description">
              <textarea
                rows={5}
                name="problemDescription"
                value={formData?.problemDescription || ""}
                onChange={handleChange}
                className={textareaStyle}
              />
            </Card>

            <Card title="Diagnosis">
              <textarea
                rows={5}
                name="diagnosis"
                value={formData?.diagnosis || ""}
                onChange={handleChange}
                className={textareaStyle}
              />
            </Card>
          </div>
        </div>

        {/* Bottom */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="grid gap-5">
            <Card title="Initial Inspection Notes" className="h-full">
              <textarea
                rows={4}
                name="initialInspectionNotes"
                value={formData?.initialInspectionNotes || ""}
                onChange={handleChange}
                className={textareaStyle}
              />
            </Card>

            <Card title="Parts Used From Stock" className="h-full">
              {canChangeParts && (
                <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_90px_auto]">
                  <CustomSelect
                    options={availableStocks.map((stock) => ({
                      value: stock.product.productId,
                      label: `${stock.product.name} (${stock.product.sku}) — ${stock.quantity} available · Rs. ${Number(stock.product.retailPrice || 0).toFixed(2)}`,
                    }))}
                    value={selectedPartId}
                    onChange={(value) => setSelectedPartId(value)}
                    placeholder="Select stock part"
                    fallBackValue="No stock parts available"
                  />
                  <input
                    min="1"
                    type="number"
                    value={partQuantity}
                    onChange={(e) => setPartQuantity(e.target.value)}
                    className={inputStyle}
                  />
                  <button
                    type="button"
                    disabled={isAddingPart}
                    onClick={handleAddPart}
                    className="rounded bg-blue-700 px-3 py-2 text-sm text-white disabled:opacity-60"
                  >
                    {isAddingPart ? "Adding..." : "Add Part"}
                  </button>
                </div>
              )}
              <div className="space-y-2 text-sm">
                {(repair.repairParts || []).length === 0 && (
                  <p className="text-slate-400">No stock parts added.</p>
                )}
                {(repair.repairParts || []).map((part) => (
                  <div
                    key={part.repairPartId}
                    className="flex items-center justify-between gap-3 rounded border border-slate-800 p-2"
                  >
                    <div>
                      <span className="text-slate-200">{part.productName}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {part.sku} · {part.quantity} × Rs. {Number(part.unitPrice).toFixed(2)} · {part.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-200">
                        Rs. {Number(part.total).toFixed(2)}
                      </span>
                      {part.status === "RESERVED" && canChangeParts && (
                        <button
                          type="button"
                          disabled={isReturningPart}
                          onClick={() => handleReturnPart(part.repairPartId)}
                          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-60"
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Cost Summary" className="h-full">
            <div className="space-y-4">
              {/* Estimated Cost */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Estimated Cost (LKR)
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    Rs.
                  </span>

                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData?.estimatedCost}
                    onChange={handleChange}
                    className={`${inputStyle} pl-10`}
                  />
                </div>
              </div>

              {/* Labour Cost */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Labour Cost (LKR)
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    Rs.
                  </span>

                  <input
                    type="number"
                    name="labourCost"
                    value={formData?.labourCost}
                    onChange={handleChange}
                    className={`${inputStyle} pl-10`}
                  />
                </div>
              </div>

              {/* Parts Cost */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Parts Cost (LKR)
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    Rs.
                  </span>

                  <input
                    type="text"
                    readOnly
                    value={Number(repair?.partsCost || 0).toLocaleString()}
                    className={`${inputStyle} pl-10 opacity-80`}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700 pt-4">
                <label className="block text-xs text-slate-400 mb-1">
                  Total Cost
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-semibold">
                    Rs.
                  </span>

                  <input
                    type="text"
                    readOnly
                    value={(
                      Number(formData?.labourCost || 0) +
                      Number(repair?.partsCost || 0)
                    ).toLocaleString()}
                    className="w-full rounded-md border border-blue-700 bg-slate-800 py-2 pl-10 pr-3 text-lg font-semibold text-blue-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <RepairInvoiceModal
        isOpen={isInvoiceModalOpen}
        repair={repair}
        onClose={() => setIsInvoiceModalOpen(false)}
        onCreate={handleCreateInvoice}
        isSaving={isCreatingInvoice}
      />
    </MainLayout>
  );
};

export default RepairDetails;
