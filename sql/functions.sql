--Обновление активности
CREATE OR REPLACE FUNCTION activity_update(
    p_doctor_id UUID,
    p_patient_id UUID,
    p_level INT,
    p_activity JSON
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$ 
BEGIN
    -- Проверяем существование записи с указанными doctor_id и patient_id
    IF NOT EXISTS (
        SELECT 1
        FROM userrelations
        WHERE doctor_id = p_doctor_id AND patient_id = p_patient_id
    ) THEN
        RETURN 'Error: Selected patient/doctor does not exists';
    END IF;

    -- Если запись существует, обновляем level и activity
    UPDATE userrelations
    SET level = p_level, 
        activity = p_activity
    WHERE doctor_id = p_doctor_id AND patient_id = p_patient_id;

	RETURN 0;
END;
$$;

GRANT EXECUTE ON FUNCTION activity_update(UUID, UUID,INT, JSON) TO backend;


--Получение статистики
CREATE OR REPLACE FUNCTION fetch_user_stat(
    p_user_id UUID,
    p_begin_date DATE,
    p_end_date DATE
) RETURNS TABLE(id UUID, user_id UUID, date DATE, data JSON)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Проверяем, что begin_date не больше end_date
    IF p_begin_date > p_end_date THEN
        RAISE EXCEPTION 'Error: Begin date cannot be greater than end date';
    END IF;

    -- Функция вернёт результат внутреннего SQL запроса
    RETURN QUERY
    SELECT u.stat_id, u.user_id, u.date, u.data
    FROM userstatistic u
    WHERE u.user_id = p_user_id
      AND u.date >= p_begin_date
      AND u.date <= p_end_date
    ORDER BY u.date;
END;
$$;
GRANT EXECUTE ON FUNCTION fetch_user_stat(UUID, DATE, DATE) TO backend;

--Сброс пароля
CREATE OR REPLACE FUNCTION reset_password(
    p_user_id UUID,
    p_new_password VARCHAR
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$ 
BEGIN
    -- Проверяем существование пользователя с данным user_id
    IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE user_id = p_user_id
    ) THEN
        RETURN 'Error: Selected user does not exists';
    END IF;

    -- Если пользователь существует, обновляем его пароль
    UPDATE users
    SET encrypted_password = p_new_password  
    WHERE user_id = p_user_id;

    RETURN 0;
END;
$$;

GRANT EXECUTE ON FUNCTION reset_password(UUID, VARCHAR) TO backend;


--Авторизация
CREATE OR REPLACE FUNCTION user_auth_request(
    p_login VARCHAR,
    p_encrypted_password VARCHAR
) RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_exists BOOLEAN;
    v_stored_password VARCHAR;
    v_user_id UUID;
BEGIN
    -- Проверяем, существует ли пользователь с таким логином
    SELECT user_id, encrypted_password INTO v_user_id, v_stored_password
    FROM users
    WHERE login = p_login AND encrypted_password = p_encrypted_password;

    -- Если пользователя с таким логином и паролём не существует
    IF NOT FOUND THEN
        RETURN 'Error: Invalid login or password';
    END IF;

    -- Сравниваем зашифрованный пароль
    IF v_stored_password = p_encrypted_password THEN
        RETURN v_user_id;
	END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION user_auth_request(VARCHAR, VARCHAR) TO backend;


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


--Ручная регистрация без проверки почты
CREATE OR REPLACE FUNCTION user_register_manual(
    p_login VARCHAR,
    p_encrypted_password VARCHAR,
    p_email VARCHAR,
    p_firstname VARCHAR,
    p_surname VARCHAR,
    p_lastname VARCHAR,
    p_role INT4	
) RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_exists BOOLEAN;
    v_user_id UUID;
BEGIN
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
    VALUES (v_user_id, p_login, p_encrypted_password, p_email, p_firstname, p_surname, p_lastname, p_role);

    RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION user_register_manual(VARCHAR, VARCHAR,VARCHAR, VARCHAR,VARCHAR, VARCHAR,INT4) TO backend;

--Запись статистики
CREATE OR REPLACE FUNCTION write_user_stat(
    p_user_id UUID,
    p_date DATE,
    p_data JSON
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Попробуем вставить строку, если она уже существует, обновим её
    INSERT INTO userstatistic (user_id, date, data)
    VALUES (p_user_id, p_date, p_data)
	-- Если сущ. => перезаписываем
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
        data = EXCLUDED.data;  
END;
$$;
GRANT EXECUTE ON FUNCTION write_user_stat(UUID, DATE, JSON) TO backend;



