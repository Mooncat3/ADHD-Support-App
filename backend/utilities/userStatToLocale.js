import generateLocaleTimestamp from "./generateLocaleTimestamp.js";

const userStatToLocale = (userStatistics, startDate, endDate) => {
  let result = [...userStatistics];

  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  const searchDate = (date) => {
    return result.findIndex(
      (element) => element.date.toISOString() === date.toISOString()
    );
  };

  userStatistics.forEach(({ date, data }, index) => {
    const newTimeStat = {};
    const isUTCDayChanged = !!data.is_utc_day_changed;

    Object.entries(data.time_stat).forEach(([k, v]) => {
      if (isNaN(parseInt(k)) || k.length > 2) return;

      const objectToSave = {
        ...v,
        timestamp_start: generateLocaleTimestamp(
          v.timestamp_start,
          v.patient_timezone
        ),
      };

      const offset = (v.timestamp_start - v.patient_timezone * 60) * 1000;

      if (offset >= oneDayInMilliseconds || (offset < 0 && !isUTCDayChanged)) {
        const dateWithOffset = new Date(date);
        dateWithOffset.setTime(
          dateWithOffset.getTime() + oneDayInMilliseconds * Math.sign(offset)
        );

        const uniqueId =
          Date.now().toString(36) + Math.random().toString(36).substring(2);

        delete result[index].data.time_stat[k];

        const searchIndex = searchDate(dateWithOffset);
        if (searchIndex === -1) {
          const newObject = {
            date: dateWithOffset,
            data: { time_stat: {} },
          };
          newObject.data.time_stat[uniqueId] = objectToSave;
          result.push(newObject);
        } else result[searchIndex].data.time_stat[uniqueId] = objectToSave;
      } else newTimeStat[k] = objectToSave;
    });

    result[index].data.time_stat = {
      ...result[index].data.time_stat,
      ...newTimeStat,
    };
  });

  [...result].forEach((record) => {
    if (Object.keys(record.data.time_stat).length === 0)
      result = result.filter((e) => e.date !== record.date);
  });

  const start = new Date(startDate);
  const end = new Date(endDate);
  return result.filter((e) => e.date >= start && e.date <= end);
};

export default userStatToLocale;
