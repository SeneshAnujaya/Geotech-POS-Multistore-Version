import html2pdf from "html2pdf.js";

const repairReceiptPDF = (repair) => {
  const currentDate = repair.createdAt
    ? new Date(repair.createdAt)
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "/")
    : new Date().toISOString().split("T")[0].replace(/-/g, "/");

  const element = document.createElement("div");

 element.innerHTML = `
<div style="
  width:700px;
  margin:auto;
  padding:20px;
  background:#fff;
  color:#000;
  font-family:Arial,sans-serif;
  box-sizing:border-box;
">

  <div style="
    display:flex;
    justify-content:space-between;
    padding-bottom:15px;
  ">
    <div>
      <h1 style="
        margin:0;
        color:#000;
        font-size:20px;
        font-weight:600
      ">
        GEOTECH COMPUTERS
      </h1>

      <div style="font-size:12px;color:#00;margin-top:6px">
        Specialized in Desktop, Laptop Computers & Accessories
      </div>

      <div style="font-size:12px;color:#000;margin-top:1px;">
        No 11, New Shopping Complex, Wanduramba, Galle
      </div>

      <div style="font-size:12px;color:#000;">
        Tel : 074 1411556
      </div>
    </div>

    <div style="text-align:right">
      <div style="
        font-size:20px;
        font-weight:600;
        color:#1e293b;
      ">
        REPAIR RECEIPT
      </div>

      <div style="margin-top:10px; font-size:12px">
        <div>Job No: ${repair.jobNumber || "-"}</div>
        <div>Date: ${currentDate}</div>
      </div>
    </div>
  </div>

  <div style="
    margin-bottom:10px;
    font-size:12px
  ">
    <div>Customer: ${repair.customerName || "-"}</div>
    <div style="margin-top:1px;">
      Phone: ${repair.customerPhone || "-"}
    </div>
  </div>

  <div style="
    font-size:16px;
    font-weight:600;
    margin-bottom:15px;
    color:#000;
  ">
    DEVICE INFORMATION
  </div>

  <table style="
    width:100%;
    border-collapse:collapse;
    margin-bottom:15px;
  ">
    <tr>
      <td style="border:1px solid #000;padding:2px;font-weight:600;width:35%;">
        Device Type
      </td>
      <td style="border:1px solid #000;padding:2px;">
        ${repair.deviceType || "-"}
      </td>
    </tr>

    <tr>
      <td style="border:1px solid #000;padding:2px;font-weight:600;">
        Brand
      </td>
      <td style="border:1px solid #000;padding:2px;">
        ${repair.brand || "-"}
      </td>
    </tr>

    <tr>
      <td style="border:1px solid #000;padding:2px;font-weight:600;">
        Model
      </td>
      <td style="border:1px solid #000;padding:2px;">
        ${repair.model || "-"}
      </td>
    </tr>

    <tr>
      <td style="border:1px solid #000;padding:2px;font-weight:600;">
        Serial Number
      </td>
      <td style="border:1px solid #000;padding:2px;">
        ${repair.serialNumber || "-"}
      </td>
    </tr>

    <tr>
      <td style="border:1px solid #000;padding:2px;font-weight:600;">
        Status
      </td>
      <td style="border:1px solid #000;padding:2px;">
        ${repair.status || "RECEIVED"}
      </td>
    </tr>
  </table>

  <div style="
    font-size:16px;
    font-weight:bold;
    margin-bottom:0px;
    color:#1e293b;
  ">
    PROBLEM DESCRIPTION
  </div>

  <div style="
    min-height:60px;
    margin-bottom:10px;
    color:#000
    border: 1px solid red;
  ">
    ${repair.problemDescription || "-"}
  </div>

  <div style="
    padding:5px;
    margin-bottom:15px;
  ">
    <div style="margin-bottom:4px;font-size: 11px; text-transoform: italic">
      Important
    </div>

    <div style="font-size:12px; font-weight:500">
      • මෙම රිසිට් පත නොමැතිව ඔබ ලබා දුන් භාණ්ඩය නිකුත් කරනු නොලැබේ.
    </div>

    <div style="font-size:12px; margin-top:2px;">
      • වගකීම් හෝ අලුත් වැඩියා සඳහා ලබා දෙන උපකරණ සූදානම් කිරීමෙන් අනතුරුව අප ඔබට දැනුම් දීමක් සිදුකරන අතර එදින සිට දින 30 කාලයක් ඇතුළත අදාල උපකරණය රැගෙන යාමට කටයුතු කරන්න.ඉන් පසු භාණ්ඩය සම්බන්ධයෙන් අප වගකියනු නොලැබේ.
    </div>

    <div style="margin-top:2px; font-size:12px;">
      • අලුත් වැඩියාව සිදු නොකර දෝෂ පරීක්ෂාවේ දී පමණක් ඩෙස්ක්ටොප් පරිගණක සහ ලැප්ටොප් පරිගණක සඳහා රු. 500.00 ක මුදලක් අය කරනු ලැබේ.
    </div>

     <div style="margin-top:2px; font-size:12px;">
      • අලුත් වැඩියා කරන භාණ්ඩයේ එම අලුත් වැඩියා කරන කොටස සඳහා පමණක් දින 30 ක කාලයක් වගකියනු ලැබේ. (මෙය printers Head සඳහා අදාළ නොවේ)
    </div>

    <div style="margin-top:2px; font-size:12px;">
      • අලුත් වැඩියා කරන භාණ්ඩයේ එම අලුත් වැඩියා කරන කොටස සඳහා පමණක් දින 30 ක කාලයක් වගකියනු ලැබේ. (මෙය printers Head සඳහා අදාළ නොවේ)
    </div>

     <div style="margin-top:2px; font-size:12px;">
      • අප ආයතනයට ලබා දෙන No Power / No Display Laptop / Desktop හි දෝෂ ඇත්නම් අප ආයතනය දැනුවත් කරන්න. (Keyboard / Display Screens / Ram / HDD / DVD writer සහ අනෙකුත් කොටස්) එසේත් නොමැති නම් ඒ සඳහා අප ආයතනය වගකියනු නොලැබේ.
    </div>

    
    
  </div>

  <div style="
    margin-top:70px;
    display:flex;
    justify-content:space-between;
  ">
    <div style="width:220px;text-align:center;">
      <div style="border-top:1px solid #000;padding-top:6px;">
        Authorized Signature
      </div>
    </div>

    <div style="width:220px;text-align:center;">
      <div style="border-top:1px solid #000;padding-top:6px;">
        Customer Signature
      </div>
    </div>
  </div>

</div>
`;

  document.body.appendChild(element);

  html2pdf()
    .set({
      filename: `Repair-${repair.jobNumber}.pdf`,
      margin: 5,
      html2canvas: {
        scale: 2,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    })
    .from(element)
    .outputPdf("bloburl")
    .then((url) => {
      window.open(url, "_blank");
      document.body.removeChild(element);
    });

// html2pdf()
//   .set({
//     filename: `Repair-${repair.jobNumber}.pdf`,
//     margin: 8,
//     image: {
//       type: "jpeg",
//       quality: 1,
//     },
//     html2canvas: {
//       scale: 3,
//       useCORS: true,
//     },
//     jsPDF: {
//       unit: "mm",
//       format: "a4",
//       orientation: "portrait",
//     },
//   })

};

export default repairReceiptPDF;