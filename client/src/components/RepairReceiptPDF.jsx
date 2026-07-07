import html2pdf from "html2pdf.js";

const repairReceiptPDF = (repair) => {
  console.log(repair);
  
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

      <div style="font-size:12px;color:#00;margin-top:3px">
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

      <div style="margin-top:5px; font-size:12px">
        <div>Job No: ${repair.jobNumber || "-"}</div>
        <div>Date: ${currentDate}</div>
        <div style='margin-top:3px'>Customer: ${repair.customerName || "-"}</div>
        <div style="margin-top:1px;">
      Phone: ${repair.customerPhone || "-"}
    </div>
      </div>
    </div>
  </div>


  <div style="
    font-size:14px;
    font-weight:600;
    margin-bottom:15px;
    color:#000;
  ">
    DEVICE INFORMATION
  </div>

 <table
  style="
    width:100%;
    border-collapse:collapse;
    border-spacing:0;
    border:1px solid #000;
    margin-bottom:0px;
    font-size:12px;
  "
>
  <tbody>
    <tr>
      <td
        style="
          border:1px solid #000;
          padding:1px 10px 11px 10px;
          font-weight:600;
          background:#f5f5f5;
          width:35%;
          vertical-align: middle;
          font-size: 13px
        "
      >
        Device Information
      </td>
      <td
        style="
          border:1px solid #000;
          padding:1px 10px 11px 10px;
          vertical-align: middle;
          font-size: 14px
        "
      >
       Type: ${repair.deviceType || "-"} | Brand:  ${repair.brand || "-"} | Model: ${repair.model || "-"} | Serial Number: ${repair.serialNumber || "-"} 
      </td>
    </tr>

    <tr>
      <td
        style="
          border:1px solid #000;
          padding:1px 10px 11px 10px;
          font-weight:600;
          background:#f5f5f5;
          vertical-align:middle;
          font-size: 13px
        "
      >
        Received Items
      </td>
      <td
        style="
          border:1px solid #000;
          padding:1px 10px 11px 10px;
          vertical-align:middle;
          font-size: 14px"
      >
        ${repair.receivedItems || "-"}
      </td>
    </tr>
  </tbody>
</table>

  <div style="
    font-size:14px;
    font-weight:bold;
    margin-bottom:0px;
    color:#1e293b;
  ">
    PROBLEM DESCRIPTION
  </div>

  <div style="
    min-height:30px;
    margin-bottom:10px;
    color:#000
    border: 1px solid red;
    font-size: 13px
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

    <div style="font-size:10px; font-weight:500">
      • මෙම රිසිට් පත නොමැතිව ඔබ ලබා දුන් භාණ්ඩය නිකුත් කරනු නොලැබේ.
    </div>

    <div style="font-size:10px; margin-top:2px;">
      • වගකීම් හෝ අලුත් වැඩියා සඳහා ලබා දෙන උපකරණ සූදානම් කිරීමෙන් අනතුරුව අප ඔබට දැනුම් දීමක් සිදුකරන අතර එදින සිට දින 30 කාලයක් ඇතුළත අදාල උපකරණය රැගෙන යාමට කටයුතු කරන්න.ඉන් පසු භාණ්ඩය සම්බන්ධයෙන් අප වගකියනු නොලැබේ.
    </div>

    <div style="margin-top:2px; font-size:10px;">
      • අලුත් වැඩියාව සිදු නොකර දෝෂ පරීක්ෂාවේ දී පමණක් ඩෙස්ක්ටොප් පරිගණක සහ ලැප්ටොප් පරිගණක සඳහා රු. 500.00 ක මුදලක් අය කරනු ලැබේ.
    </div>
     <div style="margin-top:2px; font-size:10px;">
      • අප ආයතනයට ලබා දෙන No Power / No Display Laptop / Desktop හි දෝෂ ඇත්නම් අප ආයතනය දැනුවත් කරන්න. (Keyboard / Display Screens / Ram / HDD / DVD writer සහ අනෙකුත් කොටස්) එසේත් නොමැති නම් ඒ සඳහා අප ආයතනය වගකියනු නොලැබේ.
    </div>

    
    
  </div>

  <div style="
    margin-top:60px;
    display:flex;
    justify-content:space-between;
  ">
    <div style="width:220px;text-align:center;">
      <div style="border-top:1px solid #000;padding-top:0px; font-size:14px">
        Authorized Signature
      </div>
    </div>

    <div style="width:220px;text-align:center;">
      <div style="border-top:1px solid #000;padding-top:0px; font-size:14px">
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