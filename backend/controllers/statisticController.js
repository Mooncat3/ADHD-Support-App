import pool from "../config/db.js";
import { createPdfDocument } from "../utilities/createPdfDocument.js";
import { sendEmailWithAttachment } from "../utilities/emailSender.js";

const fetchUserStat = async (patientId, startDate, endDate) => {
  await pool.query(`SET app.user_uuid = '${patientId}'`);

  const request = await pool.query(
    "SELECT * FROM fetch_user_stat($1, $2, $3);",
    [patientId, startDate, endDate]
  );

  const userStatistics = request.rows;
  if (userStatistics.length > 0) return userStatistics;
};

/* export const getStatistics = async (req, res, next) => {
  const doctorId = req.userId;

  try {
    await pool.query(`SET app.user_uuid = '${doctorId}'`);
    const request = await pool.query(`SELECT * FROM userstatistic`);

    if (request.rows.length > 0) {
      return res.status(200).json(request.rows);
    } else {
      return res.status(404).json({ detail: "Statistic does not exist" });
    }
  } catch (err) {
    next(err);
  }
}; */

export const getStatisticsFile = async (req, res, next) => {
  const { startDate, endDate, fullName } = req.query;
  const { patientId } = req.params;

  try {
    const userStatistics = await fetchUserStat(patientId, startDate, endDate);

    if (userStatistics) {
      const pdf = await createPdfDocument(userStatistics);
      const filename = `Отчёт ${fullName} за ${startDate} - ${endDate}.pdf`;

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${filename.replace(
          " ",
          "_"
        )}`,
        "Content-Length": Buffer.byteLength(pdf),
      });

      res.end(pdf);
    } else return res.status(404).json({ detail: "Statistics do not exist" });
  } catch (err) {
    next(err);
  }
};

export const sendFileEmail = async (req, res, next) => {
  const { startDate, endDate, email, fullName } = req.body;
  const { patientId } = req.params;

  try {
    const userStatistics = await fetchUserStat(patientId, startDate, endDate);

    if (userStatistics) {
      const pdf = await createPdfDocument(userStatistics);
      try {
        const filename = `Отчёт ${fullName} за ${startDate} - ${endDate}.pdf`;
        await sendEmailWithAttachment({
          to: email,
          subject: `Отчёт ${fullName} за ${startDate} - ${endDate}`,
          text: "",
          attachment: {
            filename: filename.replace(" ", "_"),
            content: pdf,
          },
        });
      } catch (err) {
        return res.status(450).json({ detail: "Statistics do not send" });
      }
      return res.status(200).json({
        status: "success",
        message: "Statistics successfully sent to email",
      });
    } else return res.status(404).json({ detail: "Statistics do not exist" });
  } catch (err) {
    next(err);
  }
};
