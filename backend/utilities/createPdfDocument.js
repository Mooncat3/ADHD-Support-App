import PDFDocument from "pdfkit";

export const createPdfDocument = async (data) => {
  return new Promise((resolve, reject) => {
    const pdfDoc = new PDFDocument();
    const buffers = [];

    pdfDoc.on("data", buffers.push.bind(buffers));
    pdfDoc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    pdfDoc.fontSize(16).text("Statistics Report", { align: "center" });

    data.forEach((item) => {
      pdfDoc.text(`User ID: ${item.user_id}, Statistic: ${item.data}`);
    });

    pdfDoc.end();
  });
};
