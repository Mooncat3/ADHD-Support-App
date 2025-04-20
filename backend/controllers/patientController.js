import pool from "../config/db.js";
import arraysEqual from "../utilities/arrayEquals.js"
import { fetchUserStat } from "./statisticController.js"
import arraysEqual from "../utilities/arrayEquals.js";
import { fetchUserStat } from "./statisticController.js";

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
    const { data, timezone } = req.body;
    const patientId = req.userId;

    await pool.query(`SET app.user_uuid = '${patientId}'`);

    const query = `
    SELECT write_user_stat($1, $2, $3);
  `;

    await pool.query(`SET app.user_uuid = '${patientId}'`);
    const request = await pool.query(`SELECT activity FROM users_pub`);
    if (request.rows.length > 0) {
      const activity = request.rows[0].activity;
      console.log(activity);

      let stats = {
        time_stat: {},
      };
      let current_date = -1;

      data.map(async (elem, i) => {
        if (elem.level == activity.level) {
          const hours = `${Math.floor(
            (Object.values(elem.time_stat)[0].timestamp_start - timezone * 60) /
              3600
          )}`;
          console.log(hours);
          const in_time =
            Math.floor(
              (Object.values(elem.time_stat)[0].timestamp_start % 3600) / 60
            ) <= 30 && activity.selected_time.includes(hours)
              ? true
              : false;

          let success = false;

          if (in_time) {
            if (activity.level === 1) {
              success = arraysEqual(
                Object.values(elem.time_stat)[0].tap_count,
                [activity.tap_count]
              );
            } else
              success =
                (activity.selected_time.indexOf(hours) + 1) % 2 !== 0
                  ? arraysEqual(
                      Object.values(elem.time_stat)[0].tap_count,
                      activity.tap_count
                    )
                  : arraysEqual(
                      Object.values(elem.time_stat)[0].tap_count,
                      [...activity.tap_count].reverse()
                    );
          }

          if (elem.date !== current_date) {
            if (i !== 0) {
              console.log(stats);
              const curDate = new Date(elem.date * 1000).toISOString();
              if (checkDateStatisticExist(curDate, patientId)) {
                await pool.query(query, [
                  patientId,
                  new Date(current_date * 1000).toISOString(),
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
            timestamp_start: Object.values(elem.time_stat)[0].timestamp_start,
            success: success,
            in_time: in_time,
            tap_count: Object.values(elem.time_stat)[0].tap_count,
          };

          if (i === data.length - 1) {
            console.log(stats);
            const curDate = new Date(elem.date * 1000).toISOString();
            if (checkDateStatisticExist(curDate, patientId)) {
              await pool.query(query, [
                patientId,
                new Date(current_date * 1000).toISOString(),
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

const checkDateStatisticExist = async (curDate, patientId) => {
  try {
    const userStatistics = await fetchUserStat(patientId, curDate, curDate);
    return !userStatistics;
  } catch (err) {
    return false;
  }
};
