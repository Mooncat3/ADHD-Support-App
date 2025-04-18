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