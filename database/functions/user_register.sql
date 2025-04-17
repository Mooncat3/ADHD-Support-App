--Регистрация без проверки почты
CREATE OR REPLACE FUNCTION user_register(
	p_doctor_id UUID,
    p_login VARCHAR,
    p_encrypted_password VARCHAR,
    p_email VARCHAR,
    p_firstname VARCHAR,
    p_surname VARCHAR,
    p_lastname VARCHAR
) RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_exists BOOLEAN;
    v_user_id UUID;
	v_doctor_exists BOOLEAN;
	v_doctor_data RECORD;
BEGIN	
     -- Получаем данные о докторе
    SELECT * INTO v_doctor_data
    FROM users
    WHERE user_id = p_doctor_id
    LIMIT 1;

    -- Если запись не найдена
    IF NOT FOUND THEN
        RETURN 'Error: Doctor not exists, check your first UUID';
    END IF;

    -- Если роль не равна 0 (не доктор)
    IF NOT (v_doctor_data.role = 0) THEN
        RETURN 'Error: Selected user is not a doctor';
    END IF;

    -- Проверяем, существует ли уже пользователь с таким логином
    SELECT EXISTS (
        SELECT 1 FROM users WHERE login = p_login
    ) INTO v_user_exists;
	
    -- Если пользователь с такими данными уже существует
    IF v_user_exists THEN
        RETURN 'Error: User with this login or email already exists';
    END IF;

    -- Генерируем новый UUID
    v_user_id := gen_random_uuid();

    -- Успешное добавление пользователя
    INSERT INTO users (user_id, login, encrypted_password, email, firstname, surname, lastname, role)
    VALUES (v_user_id, p_login, p_encrypted_password, p_email, p_firstname, p_surname, p_lastname, 1);

	 -- Запись в userrelations
    INSERT INTO userrelations (doctor_id, patient_id)
    VALUES (p_doctor_id, v_user_id);

    RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION user_register(UUID, VARCHAR, VARCHAR,VARCHAR,VARCHAR,VARCHAR,VARCHAR) TO backend;