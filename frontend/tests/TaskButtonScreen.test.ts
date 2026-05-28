import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  handleTap,
  saveSeries,
  checkSeries,
} from "@/scripts/TaskButtonScreen.helper";

jest.mock("@react-native-async-storage/async-storage");

describe("TaskButtonScreen", () => {
  const baseState = {
    timestamp_start: null,
    firstSeries: { count: 0, lastTap: null },
    secondSeries: { count: 0, lastTap: null },
    currentMode: "idle",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("начинает первую серию", () => {
    const now = Date.now();
    const updated = handleTap(baseState, "1", now);
    expect(updated.currentMode).toBe("first");
    expect(updated.firstSeries.count).toBe(1);
    expect(updated.timestamp_start).toBe(now);
  });

  it("переключает на вторую", () => {
    const now = Date.now();
    const state = {
      ...baseState,
      firstSeries: { count: 5, lastTap: now - 70000 },
    };
    const updated = handleTap(state, "2", now);
    expect(updated.currentMode).toBe("second");
    expect(updated.secondSeries.count).toBe(1);
  });

  it("завершает серию по истечению времени", async () => {
    const now = Date.now();
    const setStatus = jest.fn();
    const setTapState = jest.fn();
    const saveSeriesCallback = jest.fn();

    const tapState = {
      ...baseState,
      currentMode: "second",
      secondSeries: { count: 10, lastTap: now - 70000 },
    };

    checkSeries(tapState, "2", now, setTapState, setStatus, saveSeriesCallback);

    expect(setStatus).toHaveBeenCalledWith("Завершено");
    expect(saveSeriesCallback).toHaveBeenCalledTimes(1);
    expect(setTapState).toHaveBeenCalled();
  });

  it("сохраняет серии в кеш", async () => {
    const now = Date.now();
    const tapState = {
      timestamp_start: now,
      firstSeries: { count: 5, lastTap: now },
      secondSeries: { count: 10, lastTap: now },
      currentMode: "second",
    };

    await saveSeries(tapState, "2");

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    const [[, savedValue]] = (AsyncStorage.setItem as jest.Mock).mock.calls;
    expect(JSON.parse(savedValue)[0].time_stat).toBeDefined();
  });
});
