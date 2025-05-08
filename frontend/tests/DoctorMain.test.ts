import { validateForm } from "@/components/ValidateInputs";

describe("DoctorMain/ValidateInputs", () => {
  it("возвращает ошибки ввода формы", () => {
    const registrationData = {
      firstName: "dasdas",
      secondName: "dasdasd",
      patronymic: "",
      username: "torbell",
      password: "123123123",
      passwordRepeat: "",
      email: "torbell1337@gmail.com",
    };

    const errors = validateForm(registrationData, true);

    expect(Object.keys(errors).length).toBeGreaterThan(0);
    expect(errors.username).toBeUndefined();
    expect(errors.email).toBeUndefined();
    expect(errors.passwordRepeat).toBeDefined();
  });
});
