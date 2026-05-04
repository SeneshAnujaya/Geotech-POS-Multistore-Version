import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
// import  pdfFonts from "pdfmake/build/vfs_fonts";
// import { pdfMake as pdfFonts } from "pdfmake/build/vfs_fonts";
import { clearCart } from "../redux/cart/cartSlice";


// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const generatePDF = (
  cartItems,
  total,
  currentUserName,
  billingName,
  phoneNumber,
  dispatch = null,
  discount,
  grandTotal,
  paidAmount,
  invoiceNumber,
  serviceCharge,
  serviceDesc,
  createdAt,
  currentStoreAddress = ""
) => {

  
  const currentDate = createdAt ? new Date(createdAt).toISOString().split('T')[0].replace(/-/g, '/') : new Date().toISOString().split('T')[0].replace(/-/g, '/');

  const tableBody = [
    [
      { text: "Code", style: "tableHeader" },
      { text: "Description", style: "tableHeader" },
      { text: "Warranty", style: "tableHeader" },
      { text: "Qty", style: "tableHeader" },
      { text: "Unit Price", style: "tableHeader" },
      { text: "Amount", style: "tableHeader" },
    ],
  ];

  // Populate table rows with cart items
  cartItems.forEach((item) => {
    tableBody.push([

      {text:item.sku || "", style: "tableContent"}, 
      {text:item.name || "", style:"tableContent"},
      {text:item.warrantyPeriod, style:"tableContent"},
      {text:item.cartQuantity || 0, style:"tableContent"},
      {text:` ${parseFloat(item.price || 0).toFixed(2)}`, style:"tableContent"},
      {text:` ${(item.cartQuantity * parseFloat(item.price || 0)).toFixed(2)}`,style:"tableContent"},
    ]);
  });

  if (serviceCharge && serviceDesc) {
    tableBody.push([
      { text: serviceDesc || "Service Charge", style: "tableContent", colSpan: 5, alignment: "left" },
      {}, // Empty cell for the colSpan
      {}, 
      {}, 
      {}, 
      { text: `${parseFloat(serviceCharge).toFixed(2)}`, style: "tableContent", alignment: "right" },
    ]);
  }

  const restBalance =
    paidAmount < grandTotal ? (grandTotal - paidAmount).toFixed(2) : null;

  const docDefinition = {
    content: [
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "GEOTECH COMPUTERS", style: "header", alignment: "left" },
              {
                text: "Specialized in all types of desktop/laptop computers & accessories",
                style: "subheader",
                alignment: "left",
              },
              {
                // text: "No11, New Shopping Complex, Wanduramba Galle. Tel: 074 1411556",
                text: currentStoreAddress || "N/A",
                style: "subheader",
                alignment: "left",
              },
            ],
            alignment: "left",
          },
          {
            width: "50%",
            stack: [
              { text: "INVOICE", style: "invoiceTitle", alignment: "right" },
              {
                text: [
                  { text: "Date: ", bold: true },
                  `${currentDate}\n`,
                  { text: "Invoice No: ", bold: true },
                  `${invoiceNumber ? invoiceNumber : "N/A"}\n`,
                  { text: "Sales Rep: ", bold: true },
                  `${currentUserName}\n`,
                ],
                alignment: "right",
                style: "invoiceInfo",
              },
            ],
            alignment: "right",
          },
        ],
        columnGap: 10,
      },
      {
        text: `\n\nCustomer: ${billingName}`,
        style: "subheader",
        alignment: "left",
        marginBottom: 1,
      },
      {
        text: `Telephone Number: ${phoneNumber ? phoneNumber : "N/A"}`,
        style: "subheader",
        alignment: "left",
        marginBottom: 8,
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto", "auto", "auto", "auto"],
          body: tableBody,
        },
        layout: {
         
          hLineWidth: function (i, node) {
            return i === 0 || i === node.table.body.length ? 2 : 1; // Width for horizontal lines
          },
          vLineWidth: function (i, node) {
            return 1; // Width for vertical lines
          },
          hLineColor: function (i, node) {
            return "#000000"; // Color for horizontal lines
          },
          vLineColor: function (i, node) {
            return "#000000"; // Color for vertical lines
          },
          paddingLeft: function (i, node) {
            return 4;
          },
          paddingRight: function (i, node) {
            return 4;
          },
          paddingTop: function (i, node) {
            return 4;
          },
          paddingBottom: function (i, node) {
            return 4;
          },
        },
      },
      {
        columns: [
          {
            width: "70%",
            stack: [
              {
                text: "\nPlease submit the original invoice for warranty claims\nNo warranty for keyboards, mouse, ink cartridges, and other no-warranty items.\nNo warranty for burn marks, physical damages, corrosion, power fluctuation, and lightning.\n1 year warranty less than 14 working days (-350 days/2 years -700/3 years -1050 days).",
                style: "warranty",
              },
            ],
            alignment: "left",
          },

          {
            width: "30%",
            stack: [
              {
                text: `\n AMOUNT: LKR ${total}`,
                alignment: "right",
                bold: true,
                fontSize: 11
              },
              ...(serviceCharge > 0 ? [
                {
                  text: `SERVICE: LKR ${serviceCharge ? serviceCharge : "N/A"}`,
                  alignment: "right",
                  bold: true,
                  fontSize: 11
                }] : []),
                ...(discount > 0 ? [
              {
                text: `DISCOUNT: LKR ${discount ? discount : "N/A"}`,
                alignment: "right",
                bold: true,
                fontSize: 11
              }] : []),
       
              {
                text: `TOTAL: LKR ${grandTotal ? grandTotal : "0"}`,
                style: "total",
                alignment: "right",
                bold: true,
                marginBottom: 4
              },
              {
                text: `PAID: LKR ${paidAmount ? paidAmount : "0"}`,
                style: "total",
                alignment: "right",
                bold: true,
                fontSize: 11
              },
              ...(restBalance
                ? [
                    {
                      text: `DUE: LKR ${restBalance}`,
                      alignment: "right",
                      bold: true,
                      fontSize: 11
                    },
                  ]
                : []),
            ],
            alignment: "right",
          },
        ],
        columnGap: 10,
      },

      {
        columns: [
          {
            width: "50%",
            stack: [
              {
                text: "------------------------",
                style: "line",
                alignment: "left",
                marginTop: 30,
                paddingTop: 0,
              },
              {
                text: "\n\nAuthorized Signature",
                style: "authorized",
                alignment: "left",
                marginTop: -20,
                paddingTop: 0,
              },
            ],
          },

          {
            width: "50%",
            stack: [
              {
                text: "------------------------",
                style: "right",
                alignment: "right",
                marginTop: 30,
                paddingTop: 0,
              },
              {
                text: "\n\nCustomer Signature",
                style: "authorized",
                alignment: "right",
                marginTop: -20,
                paddingTop: 0,
              },
            ],
          },
        ],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        marginBottom: 4,
      },
      subheader: {
        fontSize: 11,
        alignment: "center",
        marginBottom: 4,
      },
      invoiceTitle: {
        fontSize: 14,
        bold: true,
      },
      invoiceInfo: {
        fontSize: 11,
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        alignment: "center",
      },
      tableContent: {
        fontSize: 11
      },
      total: {
        fontSize: 12,
        bold: true,
      },
      warranty: {
        fontSize: 9,
        italics: true,
        alignment: "left",
      },
      authorized: {
        fontSize: 10,
        bold: true,
        marginTop: 0,
        paddingTop: 0,
      },
    },
  };

  pdfMake.createPdf(docDefinition).open();

  if (dispatch) {
    dispatch(clearCart());
  }

  return true;
};

export default generatePDF;
