import api from "@/scripts/api";
import { getRole } from "@/hooks/useCheckInternetRole";
import useHandleLogout from "@/hooks/useHandleLogout";

jest.mock("@/scripts/api", () => ({
  __esModule: true,
  default: {
    getUserRole: jest.fn().mockResolvedValue({ role: 0 }),
  },
}));

jest.mock("@/hooks/useHandleLogout", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
    })
  ),
  addEventListener: jest.fn(),
}));

describe("useCheckInternetRole", () => {
  const mockRouter = {
    replace: jest.fn(),
    canDismiss: jest.fn(() => true),
    dismissAll: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    require("expo-router").useRouter.mockReturnValue(mockRouter);

    api.getUserRole.mockClear();
    useHandleLogout.mockClear();
  });

  it("переводит на страницу доктора если роль 0", async () => {
    api.getUserRole.mockResolvedValue({ role: 0 });

    await getRole(mockRouter);

    expect(mockRouter.replace).toHaveBeenCalledWith("/doctor/DoctorMain");
    expect(api.getUserRole).toHaveBeenCalled();
  });

  it("переводит на страницу пациента если роль 1", async () => {
    api.getUserRole.mockResolvedValue({ role: 1 });

    await getRole(mockRouter);

    expect(mockRouter.replace).toHaveBeenCalledWith("/patient/TaskInfoScreen");
  });

  it("переводит на страницу авторизации если роли нет", async () => {
    api.getUserRole.mockResolvedValue(null);

    await getRole(mockRouter);

    expect(useHandleLogout).toHaveBeenCalledWith(mockRouter, false);
  });
});
