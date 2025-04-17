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