-- Представление "Список пациентов для пользователя"
CREATE VIEW patients_pub AS
SELECT 
    u.firstname, 
    u.surname, 
    u.lastname, 
	u.login,
    u.email, 
    ur.patient_id,
    ur.level,
    ur.activity
FROM userrelations ur
JOIN users u ON ur.patient_id = u.user_id
WHERE ur.doctor_id = current_setting('app.user_uuid')::UUID

GRANT SELECT ON patients_pub TO backend


--Представление "Информация для каждого пользователя"
CREATE VIEW users_pub AS
SELECT 
    u.firstname, 
    u.surname, 
    u.lastname, 
    u.login,
    u.email,
    u.role,
    CASE 
        WHEN u.role = 1 THEN ur.level
        ELSE NULL
    END AS level,
    CASE 
        WHEN u.role = 1 THEN ur.activity
        ELSE NULL
    END AS activity
FROM users u
LEFT JOIN userrelations ur ON ur.patient_id = u.user_id
WHERE u.user_id = current_setting('app.user_uuid')::UUID


GRANT SELECT ON users_pub TO backend

