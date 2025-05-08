import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as apiModule from "@/scripts/api";

import { generateTaskData, sendSeries } from "@/scripts/TaskInfoScreen.helper";

describe("TaskInfoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  jest.mock("@react-native-async-storage/async-storage");
  jest.mock("@react-native-community/netinfo");
  jest.mock("@/scripts/api");
  describe("generateTaskData", () => {
    it("создаёт задания из активности", () => {
      const activity = {
        level: 2,
        selected_time: ["8", "16"],
        tap_count: [5, 10],
      };

      const result: any[] = [];
      const setTaskData = (data: any[]) => result.push(...data);
      const setExpandedItems = jest.fn();

      generateTaskData(activity, setTaskData, setExpandedItems);

      expect(result).toEqual([
        {
          id: "1",
          time: "08:00",
          level: 2,
          tap_count: [5, 10],
        },
        {
          id: "2",
          time: "16:00",
          level: 2,
          tap_count: [10, 5],
        },
      ]);
    });

    it("обрабатывает пустой массив выбранного времени в активности", () => {
      const activity = {
        level: 1,
        selected_time: [],
        tap_count: 10,
      };

      const result: any[] = [];
      const setTaskData = (data: any[]) => result.push(...data);
      const setExpandedItems = jest.fn();

      generateTaskData(activity, setTaskData, setExpandedItems);

      expect(result).toEqual([]);
      expect(setExpandedItems).not.toHaveBeenCalled();
    });
  });

  describe("sendSeries", () => {
    it("посылает серии на сервер и удаляет из кеша", async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const localSeriesEnd = yesterday.getTime();
      const seriesMock = [
        {
          date: Math.floor(localSeriesEnd / 1000),
          level: 2,
          is_utc_day_changed: false,
          time_stat: {
            "08:00": {
              timestamp_start: Math.floor(localSeriesEnd / 1000),
              tap_count: [5, 10],
              patient_timezone: 0,
              local_series_end: localSeriesEnd,
            },
          },
        },
      ];

      await AsyncStorage.setItem("daily_tasks", JSON.stringify(seriesMock));
      jest.spyOn(NetInfo, "fetch").mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      } as any);

      const apiSpy = jest
        .spyOn(apiModule.default, "setStatistics")
        .mockResolvedValue(true);

      await sendSeries();
      const newValue = await AsyncStorage.getItem("daily_tasks");
      expect(newValue).toBeNull();
      expect(apiSpy).toHaveBeenCalled();
    });

    it("не посылает серии если нет интернета", async () => {
      jest.spyOn(NetInfo, "fetch").mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      } as any);

      await AsyncStorage.setItem("daily_tasks", JSON.stringify([]));

      const apiSpy = jest.spyOn(apiModule.default, "setStatistics");

      await sendSeries();

      expect(apiSpy).not.toHaveBeenCalled();
    });
  });
});
