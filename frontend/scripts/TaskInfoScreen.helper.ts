import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import api from "@/scripts/api";

export const TASK_CACHE_KEY = "daily_tasks";

export type SeriesItem = {
  date: number;
  level: number;
  is_utc_day_changed: boolean;
  time_stat: {
    [key: string]: {
      timestamp_start: number;
      tap_count: number[];
      patient_timezone: number;
      local_series_end: number;
    };
  };
};

export const sendSeries = async (): Promise<void> => {
  try {
    const seriesStr = await AsyncStorage.getItem(TASK_CACHE_KEY);
    if (!seriesStr) return;
    const state = await NetInfo.fetch();
    if (!state.isConnected || !state.isInternetReachable) return;

    let parsed: SeriesItem[];
    try {
      parsed = JSON.parse(seriesStr);
      if (!Array.isArray(parsed)) return;
    } catch {
      return;
    }

    const groupedByLocalDate: Record<string, SeriesItem[]> = parsed.reduce(
      (groups, item) => {
        if (!item.date || !item.time_stat) return groups;

        const statValues = Object.values(item.time_stat);
        if (statValues.length === 0) return groups;

        const statObject = statValues[0];
        if (!statObject) return groups;

        const localSeriesEnd = new Date(
          statObject.local_series_end - statObject.patient_timezone * 60 * 1000
        );
        const localDateKey = localSeriesEnd.toISOString().split("T")[0];

        if (!groups[localDateKey]) {
          groups[localDateKey] = [];
        }
        groups[localDateKey].push(item);
        return groups;
      },
      {} as Record<string, SeriesItem[]>
    );

    let remainingData = [...parsed];

    for (const [localDateKeyStr, currentItems] of Object.entries(
      groupedByLocalDate
    )) {
      const isFuture = currentItems.some((item) => {
        const now = new Date();
        now.setTime(
          now.getTime() -
            Object.values(item.time_stat)[0].patient_timezone * 60 * 1000
        );
        const nowStr = now.toISOString().split("T")[0];
        return nowStr !== localDateKeyStr;
      });

      if (!isFuture) continue;

      const minDate = Math.min(...currentItems.map((i) => i.date));
      const utcDayChanged = currentItems.some((i) => i.date !== minDate);

      const transformedItems = (
        JSON.parse(JSON.stringify(currentItems)) as typeof currentItems
      ).map((item) => {
        const value = Object.values(item.time_stat)[0];
        if (value.patient_timezone < 0)
          value.timestamp_start += item.date - minDate;
        else if (!utcDayChanged) value.timestamp_start -= 86400;

        item.date = minDate;
        if (utcDayChanged) item.is_utc_day_changed = true;
        return item;
      });

      try {
        const res = await api.setStatistics(transformedItems);
        if (res) {
          remainingData = remainingData.filter(
            (i) => !currentItems.includes(i)
          );
        }
      } catch (err) {
        console.error(`Failed to send for ${localDateKeyStr}:`, err);
      }
    }

    if (remainingData.length > 0)
      await AsyncStorage.setItem(TASK_CACHE_KEY, JSON.stringify(remainingData));
    else await AsyncStorage.removeItem(TASK_CACHE_KEY);
  } catch (err) {
    console.error("sendSeries error:", err);
  }
};

export const generateTaskData = (
  activity,
  setTaskData: (data: any[]) => void,
  setExpandedItems: (data: Record<string, boolean>) => void
) => {
  if (activity.selected_time) {
    const tasks = activity.selected_time.map((time, index) => ({
      id: `${index + 1}`,
      time: `${time.padStart(2, "0")}:00`,
      level: activity.level,
      tap_count: Array.isArray(activity.tap_count)
        ? index % 2 === 0
          ? activity.tap_count
          : [activity.tap_count[1], activity.tap_count[0]]
        : activity.tap_count,
    }));

    setTaskData(tasks);
    if (tasks.length > 0) {
      setExpandedItems({ [tasks[0].id]: true });
    }
  }
};
