const userStatToLocale = (userStatistics) => {
  const result = [...userStatistics];

  userStatistics.forEach((record, index) => {
    const { date, data } = record;
    const newTimeStat = {};
    Object.entries(data.time_stat).forEach(([k, v]) => {
      const dateWithOffset = v.timestamp_start - v.patient_timezone * 60;
      newTimeStat[k] = { ...v, timestamp_start: dateWithOffset };
    });

    result[index] = { date, data: { ...data, time_stat: newTimeStat } };
  });
  return result;
};

export default userStatToLocale;
