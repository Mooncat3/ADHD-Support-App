import pool from "../config/db.js";
import { createPdfDocument } from "../utilities/createPdfDocument.js";
import { sendEmailWithAttachment } from "../utilities/emailSender.js";
import userStatToLocale from "../utilities/userStatToLocale.js";

export const fetchUserStat = async (patientId, startDate, endDate) => {
  await pool.query(`SET app.user_uuid = '${patientId}'`);

  const request = await pool.query(
    "SELECT * FROM fetch_user_stat($1, $2, $3);",
    [patientId, startDate, endDate]
  );

  const userStatistics = request.rows;
  if (userStatistics.length > 0) return userStatToLocale(userStatistics);
  return null;
};

export const getStatistics = async (req, res, next) => {
  const { patientId } = req.params;
  const { startDate, endDate } = req.query;
  console.log(patientId, startDate, endDate);
  try {
    const userStatistics = await fetchUserStat(patientId, startDate, endDate);

    if (userStatistics) {
      console.log(userStatistics);
      return res.status(200).json(userStatistics);
    } else {
      return res.status(404).json({ detail: "Statistic does not exist" });
    }
  } catch (err) {
    next(err);
  }
};

export const getStatisticsFile = async (req, res, next) => {
  const { startDate, endDate } = req.body;
  const { patientId } = req.params;
  try {
    const request_stat = await fetchUserStat(patientId, startDate, endDate);

    if (request_stat) {
      await pool.query(`SET app.user_uuid = '${request_stat[0].user_id}'`);
      const request_meta = await pool.query(
        "SELECT firstname, surname, lastname FROM users_pub;"
      );

      if (request_meta) {
        const meta = {
          firstname: request_meta.rows[0].firstname,
          surname: request_meta.rows[0].surname,
          lastname: request_meta.rows[0].lastname,
          creationDate: new Date(),
        };

        const userStatistics = {
          stat_data: request_stat,
          stat_meta: meta,
        };
        const pdf = await createPdfDocument(userStatistics);
        res.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=statistics.pdf",
          "Content-Length": Buffer.byteLength(pdf),
        });

        res.end(pdf);
      } else return res.status(404).json({ detail: "Metadata does not exist" });
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
