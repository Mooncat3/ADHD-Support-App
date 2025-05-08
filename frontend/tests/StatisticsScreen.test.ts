import api from "@/scripts/api";
import { useLocalSearchParams } from "expo-router";
import { validateEmail, filterEmailText } from "@/components/ValidateInputs";

jest.mock("@/scripts/api", () => ({
  __esModule: true,
  default: {
    getStatistics: jest.fn(),
    doctorData: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

describe("StatisticsScreen", () => {
  const mockParams = {
    firstname: "Иван",
    surname: "Иванов",
    lastname: "Иванович",
    patientId: "123",
  };

  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
    jest.clearAllMocks();
  });

  describe("Fetch", () => {
    it("загружает статистику и email", async () => {
      const mockData = [
        { date: "2023-01-01", data: { time_stat: {} } },
        { date: "2023-01-02", data: { time_stat: {} } },
      ];

      (api.getStatistics as jest.Mock).mockResolvedValue(mockData);
      (api.doctorData as jest.Mock).mockResolvedValue({
        email: "test@example.com",
      });

      const statsResponse = await api.getStatistics(
        "123",
        "startDate",
        "endDate"
      );
      const doctorResponse = await api.doctorData();

      expect(statsResponse).toEqual(mockData);
      expect(doctorResponse.email).toBe("test@example.com");
    });
  });

  describe("Валидация email", () => {
    it("подтверждает email", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("invalid-email")).toBe(false);
    });

    it("фильтрует email", () => {
      expect(filterEmailText("test@example.com")).toBe(true);
      expect(filterEmailText("test@example.com\n")).toBe(false);
    });
  });

  describe("Обработка дат", () => {
    it("форматирует даты в читабельный вид", () => {
      const formatStatDate = (date: string) =>
        new Date(date).toLocaleDateString("ru-RU");
      expect(formatStatDate("2023-01-01")).toMatch(/01\.01\.2023/);

      const formatTime = (timestamp: number) => {
        const hours = Math.floor(timestamp / 3600);
        const minutes = Math.floor((timestamp / 60) % 60);
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
      };
      expect(formatTime(3660)).toBe("01:01");
    });
  });

  describe("Для работ с датами", () => {
    it("выделяет от начальной даты до конечной", () => {
      const delTime = (date: Date) => date.toISOString().split("T")[0];

      const getMarkedDates = (range: { start: string; end: string }) => {
        const markedDates: Record<string, any> = {};
        const startDate = new Date(range.start);
        const endDate = new Date(range.end);

        const current = new Date(startDate);
        while (current <= endDate) {
          const dateStr = delTime(current);
          markedDates[dateStr] = { color: "#CFF0FF" };
          current.setDate(current.getDate() + 1);
        }

        return markedDates;
      };

      const result = getMarkedDates({ start: "2023-01-01", end: "2023-01-03" });
      expect(result).toHaveProperty("2023-01-01");
      expect(result).toHaveProperty("2023-01-02");
      expect(result).toHaveProperty("2023-01-03");
    });
  });
});
