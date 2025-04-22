import pool from "../config/db.js";
import arraysEqual from "../utilities/arrayEquals.js";
import { fetchUserStat } from "./statisticController.js";
import generateLocaleTimestamp from "../utilities/generateLocaleTimestamp.js";

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

const numToISOString = (date) => {
  return new Date(date * 1000).toISOString();
};

export const setAllStatistic = async (req, res, next) => {
  try {
    const { data } = req.body;
    const patientId = req.userId;

    const query = `SELECT write_user_stat($1, $2, $3);`;
    await pool.query(`SET app.user_uuid = '${patientId}'`);

    const request = await pool.query(`SELECT activity FROM users_pub`);
    if (request.rows.length > 0) {
      const activity = request.rows[0].activity;

      let stats = {
        time_stat: {},
      };
      let current_date = -1;

      data.map(async (elem, i) => {
        if (elem.level === activity.level) {
          const statObject = Object.values(elem.time_stat)[0];

          const localeTimestamp = generateLocaleTimestamp(
            statObject.timestamp_start,
            statObject.patient_timezone
          );

          const hours = `${Math.floor(localeTimestamp / 3600)}`;

          const in_time =
            Math.floor((localeTimestamp % 3600) / 60) <= 30 &&
            activity.selected_time.includes(hours);

          let success = false;

          if (in_time) {
            if (activity.level === 1) {
              success = arraysEqual(statObject.tap_count, [activity.tap_count]);
            } else
              success =
                (activity.selected_time.indexOf(hours) + 1) % 2 !== 0
                  ? arraysEqual(statObject.tap_count, activity.tap_count)
                  : arraysEqual(
                      statObject.tap_count,
                      [...activity.tap_count].reverse()
                    );
          }

          if (elem.date !== current_date) {
            if (i !== 0) {
              console.log(stats);
              if (await checkDateStatisticNotExist(elem.date, patientId)) {
                await pool.query(query, [
                  patientId,
                  numToISOString(current_date),
                  JSON.stringify(stats),
                ]);
              }
              stats = {
                time_stat: {},
              };
            }
            current_date = elem.date;
          }

          stats.time_stat[Object.keys(elem.time_stat)[0]] = {
            timestamp_start: statObject.timestamp_start,
            success: success,
            in_time: in_time,
            tap_count: statObject.tap_count,
            patient_timezone: statObject.patient_timezone,
          };

          if (i === data.length - 1) {
            console.log(stats);
            if (await checkDateStatisticNotExist(elem.date, patientId)) {
              await pool.query(query, [
                patientId,
                numToISOString(current_date),
                JSON.stringify(stats),
              ]);
            }
          }
        }
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Statistics successfully sent to db",
    });
  } catch (err) {
    next(err);
  }
};

const checkDateStatisticNotExist = async (date, patientId) => {
  try {
    const curDate = numToISOString(date);
    const userStatistics = await fetchUserStat(
      patientId,
      curDate,
      curDate,
      false
    );
    return !userStatistics;
  } catch (err) {
    return false;
  }
};
