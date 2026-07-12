import { useEffect, useState } from "react";
import { X } from "lucide-react";

const RepairInvoiceModal = ({ isOpen, repair, onClose, onCreate, isSaving }) => {
  const [discount, setDiscount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    if (isOpen) {
      setDiscount("0");
      setPaidAmount("0");
      setPaymentMethod("cash");
    }
  }, [isOpen]);

  if (!isOpen || !repair) return null;

  const subtotal = Number(repair.labourCost || 0) + Number(repair.partsCost || 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  const submit = (event) => {
    event.preventDefault();
    onCreate({ discount: Number(discount || 0), paidAmount: Number(paidAmount || 0), paymentMethod });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-950 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Create Repair Invoice</h2>
            <p className="text-sm text-slate-400">{repair.jobNumber} · {repair.customerName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-300"><span>Labour</span><span>Rs. {Number(repair.labourCost || 0).toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-300"><span>Parts</span><span>Rs. {Number(repair.partsCost || 0).toFixed(2)}</span></div>
          <label className="block text-slate-300">Discount (LKR)
            <input min="0" max={subtotal} step="0.01" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2 text-white" />
          </label>
          <div className="flex justify-between border-y border-slate-700 py-3 text-base font-semibold text-white"><span>Final total</span><span>Rs. {total.toFixed(2)}</span></div>
          <label className="block text-slate-300">Payment received now (LKR)
            <input min="0" max={total} step="0.01" type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2 text-white" />
          </label>
          <label className="block text-slate-300">Payment method
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-full rounded border border-slate-700 bg-slate-900 p-2 text-white">
              <option value="cash">Cash</option><option value="card">Card</option><option value="bank_transfer">Bank transfer</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded bg-slate-700 px-4 py-2 text-sm text-white">Cancel</button>
          <button disabled={isSaving || Number(paidAmount || 0) > total} className="rounded bg-orange-600 px-4 py-2 text-sm text-white disabled:opacity-60">{isSaving ? "Creating..." : "Issue Invoice"}</button>
        </div>
      </form>
    </div>
  );
};

export default RepairInvoiceModal;
