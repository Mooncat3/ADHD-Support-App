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