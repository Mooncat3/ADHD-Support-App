import PDFDocument from "pdfkit";

function formatSecondsToHHMM(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

export const createPdfDocument = async (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.registerFont("OpenSans", "utilities/fonts/OpenSans-Regular.ttf");
    const buffers = [];
    console.log("DATA");
    console.log(data);
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    const stat_meta = data.stat_meta;
    const formattedDate = stat_meta.creationDate.toLocaleDateString("ru-RU");

    const margin = doc.page.margins.left;

    const fullName = `Пациент: ${stat_meta.firstname} ${stat_meta.surname} ${stat_meta.lastname}`;

    // ФИО
    doc
      .font("OpenSans")
      .fontSize(14)
      .fillColor("#000")
      .text(fullName, margin, 50)
      .moveDown(0.5);

    doc.text(`Создано: ${formattedDate}`, 50);

    // Название
    doc
      .moveDown(1.5)
      .fontSize(18)
      .fillColor("#000")
      .text("Статистика нажатий", { align: "center" })
      .moveDown(2);

    data.stat_data.forEach((item) => {
      // Дата статистики
      doc
        .font("OpenSans")
        .fontSize(14)
        .fillColor("#2c3e50")
        .text(`Дата: ${item.date.toLocaleDateString("ru-RU")}`)
        .moveDown(0.5);

      const bullet = "•";

      for (const key in item.data.time_stat) {
        const stat = item.data.time_stat[key];

        // Время начала выполнения
        doc
          .font("OpenSans")
          .fontSize(12)
          .fillColor("#333")
          .text(
            `Время начала выполнения: ${formatSecondsToHHMM(
              stat.timestamp_start
            )}`
          )
          .moveDown(0.5);

        // Второй уровен вложенности  — данные
        doc.font("OpenSans").fontSize(12).fillColor("#333");

        const count_info =
          stat.tap_count.length > 1
            ? `Количество нажатий (первая|вторая серия): ${stat.tap_count[0]}|${stat.tap_count[1]}`
            : `Количество нажатий: ${stat.tap_count}`;

        doc.text(`${bullet} ${count_info}`);

        doc.text(`${bullet} Правильность выполнения: `, { continued: true });

        doc
          .fillColor(stat.success ? "green" : "red")
          .text(stat.success ? "правильно" : "неправильно");

        doc
          .fillColor("#333")
          .text(`${bullet} Вовремя нажатие: `, { continued: true });

        doc
          .fillColor(stat.in_time ? "green" : "red")
          .text(stat.in_time ? "вовремя" : "не вовремя");
        doc.moveDown(1);
      }

      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#ccc").stroke();
      doc.moveDown(1.5);
    });

    doc.end();
  });
};
