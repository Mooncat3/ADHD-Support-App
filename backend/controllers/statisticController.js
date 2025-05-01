import pool from "../config/db.js";
import { createPdfDocument } from "../utilities/createPdfDocument.js";
import { sendEmailWithAttachment } from "../utilities/emailSender.js";
import userStatToLocale from "../utilities/userStatToLocale.js";

export const fetchUserStat = async (
  patientId,
  startDate,
  endDate,
  locale = true
) => {
  await pool.query(`SET app.user_uuid = '${patientId}'`);

  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  const startDateDB = new Date(startDate);
  startDateDB.setTime(startDateDB.getTime() - oneDayInMilliseconds);
  const endDateDB = new Date(endDate);
  endDateDB.setTime(endDateDB.getTime() + oneDayInMilliseconds);

  const dbParams = locale
    ? [patientId, startDateDB.toISOString(), endDateDB.toISOString()]
    : [patientId, startDate, endDate];
  const request = await pool.query(
    "SELECT * FROM fetch_user_stat($1, $2, $3);",
    dbParams
  );

  const userStatistics = request.rows;
  if (userStatistics.length > 0)
    return locale
      ? userStatToLocale(userStatistics, startDate, endDate)
      : userStatistics;
  return null;
};

export const getStatistics = async (req, res, next) => {
  const { patientId } = req.params;
  const { startDate, endDate } = req.query;
  console.log(patientId, startDate, endDate);
  try {
    const userStatistics = await fetchUserStat(patientId, startDate, endDate);

    if (userStatistics.length) {
      console.log(userStatistics);
      return res.status(200).json(userStatistics);
    } else {
      return res.status(404).json({ detail: "Statistic does not exist" });
    }
  } catch (err) {
    next(err);
  }
};

const getPDF = async (patientId, startDate, endDate, timezone) => {
  const request_stat = await fetchUserStat(patientId, startDate, endDate);

  if (request_stat) {
    await pool.query(`SET app.user_uuid = '${patientId}'`);
    const request_meta = await pool.query(
      "SELECT firstname, surname, lastname FROM users_pub;"
    );

    if (request_meta) {
      const meta = {
        firstname: request_meta.rows[0].firstname,
        surname: request_meta.rows[0].surname,
        lastname: request_meta.rows[0].lastname,
        creationDate: new Date(),
        timezone,
      };

      const userStatistics = {
        stat_data: request_stat,
        stat_meta: meta,
      };
      const pdf = await createPdfDocument(userStatistics);
      return pdf;
    }
  }
};

export const getStatisticsFile = async (req, res, next) => {
  try {
    const { startDate, endDate, timezone } = req.body;
    const { patientId } = req.params;
    const pdf = await getPDF(patientId, startDate, endDate, timezone);

    if (pdf) {
      return res
        .writeHead(200, {
          "content-type": "application/pdf",
          "content-disposition": "attachment; filename=statistics.pdf",
          "content-length": Buffer.byteLength(pdf),
        })
        .end(pdf);
    }

    return res.status(404).json({ detail: "Statistics do not exist" });
  } catch (err) {
    next(err);
  }
};

const utcToLocale = (date, timezone) => {
  const currentDate = new Date(date);
  const newDate = new Date(currentDate.getTime() - timezone * 60 * 1000);
  return newDate.toLocaleDateString("ru-RU");
};

export const sendFileEmail = async (req, res, next) => {
  try {
    const { startDate, endDate, email, fullName, timezone } = req.body;
    const { patientId } = req.params;

    const pdf = await getPDF(patientId, startDate, endDate, timezone);

    if (pdf) {
      try {
        const start = utcToLocale(startDate, timezone);
        const end = utcToLocale(endDate, timezone);

        const filename = `Отчёт ${fullName} за ${start} - ${end}.pdf`;

        await sendEmailWithAttachment({
          to: email,
          subject: `Отчёт ${fullName} за ${start} - ${end}`,
          text: "",
          attachment: {
            filename: filename.replaceAll(" ", "_"),
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
    }

    return res.status(404).json({ detail: "Statistics do not exist" });
  } catch (err) {
    next(err);
  }
};
