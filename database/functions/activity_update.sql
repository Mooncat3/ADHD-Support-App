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