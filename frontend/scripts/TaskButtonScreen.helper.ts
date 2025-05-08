import AsyncStorage from "@react-native-async-storage/async-storage";

const TASK_CACHE_KEY = "daily_tasks";
const SERIES_COOLDOWN = 60;

export function handleTap(prev, level, now) {
  if (prev.currentMode === "idle" && prev.firstSeries.count === 0) {
    return {
      ...prev,
      timestamp_start: now,
      currentMode: "first",
      firstSeries: { count: 1, lastTap: now },
    };
  }

  if (
    level === "2" &&
    prev.currentMode === "idle" &&
    prev.secondSeries.count === 0
  ) {
    return {
      ...prev,
      currentMode: "second",
      secondSeries: { count: 1, lastTap: now },
    };
  }

  if (prev.currentMode === "first") {
    return {
      ...prev,
      firstSeries: {
        count: prev.firstSeries.count + 1,
        lastTap: now,
      },
    };
  }

  if (prev.currentMode === "second") {
    return {
      ...prev,
      secondSeries: {
        count: prev.secondSeries.count + 1,
        lastTap: now,
      },
    };
  }

  return prev;
}

function getStartOfDayUnix(now: number) {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function getCurrentHour(now: number) {
  const d = new Date(now);
  return d.getHours().toString();
}

function getSecondsSinceMidnight(now: number) {
  const d = new Date(now);
  return d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
}

export async function saveSeries(tapState, level) {
  const now = tapState.timestamp_start;
  if (!now) return;

  const startOfDayUnix = getStartOfDayUnix(now);
  const currentHour = getCurrentHour(now);
  const timestampStart = getSecondsSinceMidnight(now);

  const existingDataStr = await AsyncStorage.getItem(TASK_CACHE_KEY);
  let existingData = existingDataStr ? JSON.parse(existingDataStr) : [];

  let todayData = existingData.find((item) => item.date === startOfDayUnix);
  if (!todayData) {
    todayData = {
      date: startOfDayUnix,
      level: parseInt(level),
      time_stat: {},
    };
    existingData.push(todayData);
  }

  const tapData =
    level === "1"
      ? [tapState.firstSeries.count]
      : [tapState.firstSeries.count, tapState.secondSeries.count];

  todayData.time_stat[currentHour] = {
    timestamp_start: timestampStart,
    tap_count: tapData,
    patient_timezone: new Date().getTimezoneOffset(),
    local_series_end: Date.now(),
  };

  await AsyncStorage.setItem(TASK_CACHE_KEY, JSON.stringify(existingData));
}

export function checkSeries(
  tapState,
  level,
  now,
  setTapState,
  setStatus,
  saveSeriesCallback
) {
  if (
    tapState.currentMode === "first" &&
    tapState.firstSeries.lastTap &&
    now - tapState.firstSeries.lastTap > SERIES_COOLDOWN * 1000
  ) {
    if (level === "1") {
      setStatus("Завершено");
      saveSeriesCallback(tapState, level);
    }
    setTapState((prev) => ({
      ...prev,
      currentMode: "idle",
      firstSeries: {
        count: level === "1" ? 0 : prev.firstSeries.count,
        lastTap: level === "1" ? null : prev.firstSeries.lastTap,
      },
    }));
  }

  if (
    level === "2" &&
    tapState.currentMode === "idle" &&
    tapState.firstSeries.lastTap &&
    now - tapState.firstSeries.lastTap > SERIES_COOLDOWN * 2000
  ) {
    setStatus("Завершено");
    saveSeriesCallback(tapState, level);
    setTapState((prev) => ({
      ...prev,
      firstSeries: { count: 0, lastTap: null },
      currentMode: "idle",
    }));
  }

  if (
    tapState.currentMode === "second" &&
    tapState.secondSeries.lastTap &&
    now - tapState.secondSeries.lastTap > SERIES_COOLDOWN * 1000
  ) {
    setStatus("Завершено");
    saveSeriesCallback(tapState, level);
    setTapState({
      timestamp_start: null,
      firstSeries: { count: 0, lastTap: null },
      secondSeries: { count: 0, lastTap: null },
      currentMode: "idle",
    });
  }
}
