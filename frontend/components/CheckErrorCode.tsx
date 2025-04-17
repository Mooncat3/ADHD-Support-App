export const checkCode = (
  status: string | null,
  isRegistration: boolean = true
) => {
  if (isRegistration) {
    if (status === "400") return "Неверный логин или пароль";
    else return "Ошибка сервера";
  }
};
