import html2pdf from "html2pdf.js";
import { formatDateTime } from "../dateUtil";

const repairInvoicePDF = (invoice) => {
  const repairJob = invoice.repairJob || {};
  const parts = invoice.parts || [];
  const issuedDate = formatDateTime(invoice.issuedAt || invoice.createdAt || invoice.updatedAt);

  const labourCost = Number(invoice.labourCost || 0);
  const partsCost = Number(invoice.partsCost || 0);
  const discount = Number(invoice.discount || 0);
  const totalAmount = Number(invoice.totalAmount || labourCost + partsCost - discount);
  const paidAmount = Number(invoice.paidAmount || 0);
  const balance = totalAmount - paidAmount;

  const element = document.createElement("div");
  element.innerHTML = `
    <div style="width:700px;margin:auto;padding:24px;background:#fff;color:#111;font-family:Arial,sans-serif;box-sizing:border-box">
      <div style="display:flex;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid #111">
        <div>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#000">GEOTECH COMPUTERS</h1>
          <div style="margin-top:4px;font-size:12px">Specialized in Desktop, Laptop Computers & Accessories</div>
          <div style="font-size:12px">No 11, New Shopping Complex, Wanduramba, Galle</div>
          <div style="font-size:12px">Tel : 074 1411556</div>
        </div>

        <div style="text-align:right;font-size:13px">
          <div style="font-size:20px;font-weight:700">REPAIR INVOICE</div>
          <div style="margin-top:6px">Invoice No: ${invoice.invoiceNumber || "-"}</div>
          <div>Date: ${issuedDate || "-"}</div>
          <div>Job No: ${repairJob.jobNumber || "-"}</div>
        </div>
      </div>

      <div style="margin:16px 0 10px;font-size:13px;line-height:1.5">
        <div><strong>Customer:</strong> ${invoice.customerName || "-"}</div>
        <div><strong>Phone:</strong> ${invoice.customerPhone || "-"}</div>
        <div><strong>Device:</strong> ${invoice.deviceType || "-"} ${invoice.brand || "-"} ${invoice.model || "-"}</div>
        ${invoice.serialNumber ? `<div><strong>Serial No:</strong> ${invoice.serialNumber}</div>` : ""}
      </div>

      <table style="width:100%;border-collapse:separate;border-spacing:0;font-size:13px;margin:0">
        <thead>
          <tr>
            <th style="border:1px solid #222;padding:8px;text-align:left;background:#f4f4f4">Description</th>
            <th style="border:1px solid #222;border-left:none;padding:8px;text-align:right;background:#f4f4f4">Amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #222;border-top:none;padding:8px">Service Charge</td>
            <td style="border:1px solid #222;border-top:none;border-left:none;padding:8px;text-align:right">${labourCost.toFixed(2)}</td>
          </tr>
          ${parts.map((part) => `
            <tr>
              <td style="border:1px solid #222;border-top:none;padding:8px">Part: ${part.productName || "-"} (${part.sku || "-"}) — ${part.quantity || 0} × Rs. ${Number(part.unitPrice || 0).toFixed(2)}</td>
              <td style="border:1px solid #222;border-top:none;border-left:none;padding:8px;text-align:right">${Number(part.total || 0).toFixed(2)}</td>
            </tr>
          `).join("")}
          ${parts.length === 0 && partsCost > 0 ? `
            <tr>
              <td style="border:1px solid #222;border-top:none;padding:8px">Parts</td>
              <td style="border:1px solid #222;border-top:none;border-left:none;padding:8px;text-align:right">${partsCost.toFixed(2)}</td>
            </tr>
          ` : ""}
          <tr>
            <td style="border:1px solid #222;border-top:none;padding:8px">Discount</td>
            <td style="border:1px solid #222;border-top:none;border-left:none;padding:8px;text-align:right">-${discount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:14px;margin-left:auto;width:296px;font-size:13px;padding:7px 9px;border:1px solid #111">
        <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;padding-bottom:3px">
          <span>Total</span>
          <span>Rs. ${totalAmount.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:3px;color:#374151">
          <span>Paid</span>
          <span>Rs. ${paidAmount.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:3px;color:#374151">
          <span>Balance</span>
          <span>Rs. ${balance.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-top:44px;display:flex;justify-content:space-between">
        <div style="width:220px;text-align:center">
          <div style="border-top:1px solid #111;padding-top:6px;font-size:13px">Authorized Signature</div>
        </div>
        <div style="width:220px;text-align:center">
          <div style="border-top:1px solid #111;padding-top:6px;font-size:13px">Customer Signature</div>
        </div>
      </div>

      <p style="margin-top:24px;font-size:10px;text-align:center">Thank you for choosing GEOTECH COMPUTERS.</p>
    </div>
  `;

  document.body.appendChild(element);

  html2pdf()
    .set({
      filename: `Repair-Invoice-${invoice.invoiceNumber || "invoice"}.pdf`,
      margin: 5,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .outputPdf("bloburl")
    .then((url) => {
      window.open(url, "_blank");
      document.body.removeChild(element);
    })
    .catch(() => {
      if (element.parentNode) document.body.removeChild(element);
    });
};

export default repairInvoicePDF;
