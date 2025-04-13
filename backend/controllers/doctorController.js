import pool from "../config/db.js";
import { createPdfDocument } from "../utilities/createPdfDocument.js";
import { sendEmailWithAttachment } from "../utilities/emailSender.js";

export const get = async (req, res, next) => {
  try {
    const doctorId = req.userId;

    await pool.query(`SET app.user_uuid = '${doctorId}'`);
    const request = await pool.query("SELECT * FROM users_pub");

    if (request.rows.length > 0)
      return res.status(200).json({ id: doctorId, ...request.rows[0] });
    else return res.status(404).json({ detail: "No doctor data" });
  } catch (err) {
    next(err);
  }
};

export const getPatients = async (req, res, next) => {
  try {
    const doctorId = req.userId;

    await pool.query(`SET app.user_uuid = '${doctorId}'`);
    const request = await pool.query(`SELECT * FROM patients_pub`);

    if (request.rows.length > 0) {
      return res.status(200).json(request.rows);
    } else {
      return res
        .status(404)
        .json({ detail: "No patients found for this doctor" });
    }
  } catch (err) {
    next(err);
  }
};

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
  const { patientId, startDate, endDate, fullName } = req.query;

  try {
    const userStatistics = await fetchUserStat(patientId, startDate, endDate);

    if (userStatistics) {
      const pdf = await createPdfDocument(userStatistics);
      const filename = `Отчёт_${fullName}_за ${startDate}_-_${endDate}.pdf`;

      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${filename}`,
        "Content-Length": Buffer.byteLength(pdf),
      });

      res.end(pdf);
    } else return res.status(404).json({ detail: "Statistic does not exist" });
  } catch (err) {
    next(err);
  }
};

export const sendFileEmail = async (req, res, next) => {
  const { patientId, startDate, endDate, email, fullName } = req.body;

  try {
    const userStatistics = await fetchUserStat(patientId, startDate, endDate);

    if (userStatistics) {
      const pdf = await createPdfDocument(userStatistics);
      try {
        await sendEmailWithAttachment({
          to: email,
          subject: `Отчёт ${fullName} за ${startDate} - ${endDate}`,
          text: "",
          attachment: {
            filename: `Отчёт ${fullName} за ${startDate} - ${endDate}.pdf`,
            content: pdf,
          },
        });
      } catch (err) {
        return res.status(450).json({ detail: "Statistic does not send" });
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

export const registerPatient = async (req, res, next) => {
  try {
    const { username, password, email, firstName, secondName, patronymic } =
      req.body;

    const doctorId = req.userId;

    const request = await pool.query(
      "SELECT user_register($1, $2, $3, $4, $5, $6, $7);",
      [doctorId, username, password, email, firstName, secondName, patronymic]
    );

    const result = request.rows[0].user_register;
    if (result === "Error: User with this login or email already exists")
      return res
        .status(400)
        .json({ detail: "User with this login or email already exists" });

    const userId = request.rows[0].user_register;

    return res.status(200).json({
      status: "success",
      message: `Patient with ID ${userId} registered`,
    });
  } catch (err) {
    next(err);
  }
};

export const getActivity = async (req, res, next) => {
  const { patientId } = req.params;

  try {
    await pool.query(`SET app.user_uuid = '${patientId}'`);
    const request = await pool.query(`SELECT activity FROM users_pub`);
    if (request.rows.length > 0) return res.status(200).json(request.rows[0]);
    return res.status(204).json({ detail: "Activity do not exist" });
  } catch (err) {
    next(err);
  }
};

export const putActivity = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const { patientId } = req.params;
    const { activity } = req.body;

    const request = await pool.query(
      "SELECT activity_update($1, $2, $3, $4);",
      [doctorId, patientId, activity.level, JSON.stringify(activity)]
    );

    if (request.rows.length > 0)
      return res.status(200).json({ message: "Activity successfully changed" });
    return res.status(400).json({ detail: "Failed to put activity" });
  } catch (err) {
    next(err);
  }
};
