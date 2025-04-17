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