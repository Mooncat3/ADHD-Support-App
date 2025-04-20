--Запись статистики
CREATE OR REPLACE FUNCTION write_user_stat(
    p_user_id UUID,
    p_date TIMESTAMPTZ,
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
GRANT EXECUTE ON FUNCTION write_user_stat(UUID, TIMESTAMPTZ, JSON) TO backend;
