import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
// import  pdfFonts from "pdfmake/build/vfs_fonts";
// import { pdfMake as pdfFonts } from "pdfmake/build/vfs_fonts";

// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const payReceiptPDF = (singleClientInfo, amountToPay, receiptNumber, createdAt) => {
   const currentDate = createdAt ? new Date(createdAt).toISOString().split('T')[0].replace(/-/g, '/') : new Date().toISOString().split('T')[0].replace(/-/g, '/');;

  const tableBody = [
    [
      { text: "From", style: "tableHeader", alignment: "left" },
      { text: "Amount", style: "tableHeader" },
    ],
    [
      { text: singleClientInfo || "N/A", style: "tableContent" },
      { text: `${amountToPay.toFixed(2)}`, style: "tableContent" },
    ],
  ];


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
                text: "No11, New Shopping Complex, Wanduramba Galle. Tel: 074 1411556",
                style: "subheader",
                alignment: "left",
              },
            ],
            alignment: "left",
          },
          {
            width: "50%",
            stack: [
              {
                text: "PAYMENT RECEIPT",
                style: "invoiceTitle",
                alignment: "right",
              },
              {
                text: [
                  { text: "Date: ", bold: true },
                  `${currentDate}\n`,
                  { text: "Receipt No: ", bold: true },
                  `${receiptNumber}\n`,
                ],
                alignment: "right",
                style: "invoiceInfo",
                fontSize: 11.5,
              },
            ],
            alignment: "right",
          },
        ],
        columnGap: 10,
        marginBottom: 15,
      },

      {
        table: {
          headerRows: 1,
          widths: ["*", "auto"],
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
                text: "\n\nPlease Note : \nPlease keep this receipt for your records. It serves as proof of your payment.\n Thank you for your payment. We appreciate your support and look forward to \n serving you again.",
                style: "warranty",
              },
            ],
            alignment: "left",
          },

          {
            width: "30%",
            stack: [
              {
                text: `TOTAL: LKR ${amountToPay.toFixed(2)}`,
                style: "total",
                alignment: "right",
                bold: true,
                marginBottom: 4,
                marginTop: 10,
              },
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
        fontSize: 15,
        bold: true,
        marginBottom: 3,
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
        fontSize: 11,
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

  return true;
};

export default payReceiptPDF;
