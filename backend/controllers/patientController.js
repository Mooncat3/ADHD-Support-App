import pool from "../config/db.js";

export const get = async (req, res, next) => {
  try {
    const patientId = req.userId;

    await pool.query(`SET app.user_uuid = '${patientId}'`);
    const request = await pool.query(
      "SELECT firstname, surname, lastname, activity FROM users_pub"
    );

    if (request.rows.length > 0)
      return res.status(200).json({ id: patientId, ...request.rows[0] });

    return res.status(404).json({ detail: "No patient data" });
  } catch (err) {
    next(err);
  }
};

export const setPatientStatistic = async (patientId, date, time_stat) => {
  try {
    await pool.query(`SET app.user_uuid = '${patientId}'`);

    const insertPromises = Object.entries(time_stat).map(
      async ([key, stat]) => {
        const query = `
        SELECT write_user_stat($1, $2, $3);
      `;

        const result = await pool.query(query, [
          patientId,
          new Date(date * 1000),
          JSON.stringify({
            timestamp_start: stat.timestamp_start,
            success: stat.success,
            in_time: stat.in_time,
            tap_count: stat.tap_count,
          }),
        ]);

        return result;
      }
    );

    const results = await Promise.all(insertPromises);
    console.log(results);
    return results;
  } catch (err) {
    console.error("Error in setPatientStatistic:", err);
    throw err;
  }
};

export const setAllStatistic = async (req, res) => {
  const { patientId, dates } = req.body;

  console.log(dates);
  if (!patientId || !Array.isArray(dates)) {
    return res.status(400).json({ detail: "Invalid data format." });
  }

  try {
    for (const singleDate of dates) {
      try {
        await setPatientStatistic(
          patientId,
          singleDate.date,
          singleDate.time_stat
        );
      } catch (innerErr) {
        console.error(
          `Error writing stat for date ${singleDate.date}:`,
          innerErr
        );
        throw new Error(
          `Error writing stat for date ${singleDate.date}: ${innerErr.message}`
        );
      }
    }

    res.status(200).json({ detail: "All statistics successfully recorded." });
  } catch (err) {
    res.status(500).json({ detail: `Server error: ${err.message}` });
  }
};
