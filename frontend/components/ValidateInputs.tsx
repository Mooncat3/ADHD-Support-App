export const filterNameText = (text: string): boolean =>
  /^[A-Za-zА-Яа-яЁё\s]*$/.test(text);
export const filterUsernameText = (text: string): boolean =>
  /^[A-Za-z_0-9]*$/.test(text);
export const filterPasswordText = (text: string): boolean =>
  /^[A-Za-z0-9!\"#$%&'()*+,-.\/:;<=>?@[\]^_`{|}~]*$/.test(text);
export const filterEmailText = (text: string): boolean =>
  /^[A-Za-z0-9@.\-_]*$/.test(text);

export const emailValidationRegex =
  /^[a-zA-Z0-9.\-_]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email: string) => {
  return emailValidationRegex.test(email);
};

export const getFieldTooltip = (field: string) => {
  switch (field) {
    case "firstName":
    case "secondName":
    case "patronymic":
      return "ФИО должно содержать только буквенные символы";
    case "username":
      return "Логин должен содержать только латинские буквы";
    case "password":
      return "Пароль может содержать только латинские буквы, цифры и спецсимволы";
    case "email":
      return "Введите действительный email-адрес (например, example@mail.com)";
    default:
      return null;
  }
};

export const validateForm = (formData: any, isRegistration: boolean = true) => {
  let errors: { [key: string]: string | null } = {};
  if (isRegistration) {
    if (!formData.firstName) {
      errors.firstName = "Имя обязательно для заполнения";
    }
    if (!formData.secondName) {
      errors.secondName = "Фамилия обязательна для заполнения";
    }
  }

  if (!formData.username) {
    errors.username = "Логин обязателен для заполнения";
  } else if (formData.username.length < 5) {
    errors.username = "Логин должен содержать не менее 5 символов";
  }
  if (!formData.password) {
    errors.password = "Пароль обязателен для заполнения";
  } else if (formData.password.length < 8) {
    errors.password = "Пароль должен содержать не менее 8 символов";
  } else if (isRegistration && formData.password != formData.passwordRepeat) {
    errors.passwordRepeat = "Пароли не совпадают";
  }

  if (isRegistration) {
    if (!formData.email) {
      errors.email = "Email обязателен для заполнения";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Некорректно введен email";
    }
  }

  return errors;
};
