import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Loader2, Save, Printer, Receipt } from "lucide-react";

import MainLayout from "../components/MainLayout";
import {
  useFetchSingleRepairJobQuery,
  useUpdateRepairDetailsMutation,
  useUpdateRepairJobMutation,
} from "../redux/apiSlice";
import {
  showErrorToast,
  showSuccessToast,
} from "../components/ToastNotification";

const Card = ({ title, children }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
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

  const { data, isLoading, isError } = useFetchSingleRepairJobQuery({
    repairJobId: id,
    storeId: selectedStoreId,
  });

  // Update Rtk Query
  const [updateRepairDetails, { isLoading: isSaving }] =
    useUpdateRepairDetailsMutation();

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

    console.log(id, selectedStoreId, formData);
    

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

              <button className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm hover:bg-blue-800">
                <Printer size={16} />
                Receipt
              </button>

              <button className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm hover:bg-orange-700">
                <Receipt size={16} />
                Invoice
              </button>
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
                <option>COMPLETED</option>
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
          <Card title="Received Items">
            {/* <p className="whitespace-pre-wrap text-sm text-slate-300">
            {repair.receivedItems || "-"}
          </p> */}
            <textarea
              rows={3}
              name="receivedItems"
              value={formData?.receivedItems || ""}
              onChange={handleChange}
              className={textareaStyle}
            />
          </Card>

          <Card title="Physical Condition">
            {/* <p className="whitespace-pre-wrap text-sm text-slate-300">
            {repair.physicalCondition || "-"}
          </p> */}
            <textarea
              rows={3}
              name="physicalCondition"
              value={formData?.physicalCondition || ""}
              onChange={handleChange}
              className={textareaStyle}
            />
          </Card>

          <Card title="Problem Description">
            {/* <p className="whitespace-pre-wrap text-sm text-slate-300">
            {repair.problemDescription}
          </p> */}
            <textarea
              rows={5}
              name="problemDescription"
              value={formData?.problemDescription || ""}
              onChange={handleChange}
              className={textareaStyle}
            />
          </Card>

          <Card title="Diagnosis">
            {/* <p className="whitespace-pre-wrap text-sm text-slate-300">
            {repair.diagnosis || "-"}
          </p> */}
            <textarea
              rows={5}
              name="diagnosis"
              value={formData?.diagnosis || ""}
              onChange={handleChange}
              className={textareaStyle}
            />
          </Card>
        </div>

        {/* Bottom */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card title="Initial Inspection Notes">
            {/* <p className="text-sm text-slate-300">
              {repair.initialInspectionNotes || "-"}
            </p> */}
            <textarea
              rows={4}
              name="initialInspectionNotes"
              value={formData?.initialInspectionNotes || ""}
              onChange={handleChange}
              className={textareaStyle}
            />
          </Card>

         <Card title="Cost Summary">
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
          type="number"
          name="partsCost"
          value={formData?.partsCost}
          onChange={handleChange}
          className={`${inputStyle} pl-10`}
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
          value={Number(formData?.totalCost || 0).toLocaleString()}
          className="w-full rounded-md border border-blue-700 bg-slate-800 py-2 pl-10 pr-3 text-lg font-semibold text-blue-400 focus:outline-none"
        />
      </div>

    </div>

  </div>
</Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default RepairDetails;
