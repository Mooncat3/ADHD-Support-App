export const checkCode = (status: any, isRegistration: boolean = true) => {
    if (isRegistration) {
        if (status === '401')
            return 'Неверный логин или пароль';
        else 
            return 'Ошибка сервера';
    }
};

  