-- Создание таблицы Users
CREATE TABLE Users (
    user_id UUID PRIMARY KEY,
    firstname VARCHAR(32) NOT NULL,
    surname VARCHAR(32) NOT NULL,
    lastname VARCHAR(32) NOT NULL,
    login VARCHAR(32) UNIQUE NOT NULL,
    encrypted_password VARCHAR(64) NOT NULL,
    role INT CHECK (role IN (0, 1)) NOT NULL,
    email VARCHAR(64) UNIQUE
);


-- Создание таблицы UserStatistic
CREATE TABLE UserStatistic (
    stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE CHECK (date BETWEEN '2025-01-01' AND '2200-01-01') NOT NULL,
    data JSON NOT NULL CHECK (LENGTH(data::TEXT) <= 1048576),
    CONSTRAINT fk_user_stat FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

ALTER TABLE userstatistic
ADD CONSTRAINT userstat_unique UNIQUE(user_id, date);


-- Создание таблицы UserRelations
CREATE TABLE UserRelations (
    rel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    level INT CHECK (level >= 0),
    activity JSON CHECK (LENGTH(activity::TEXT) <= 1048576),
    CONSTRAINT doctor_id FOREIGN KEY (doctor_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT patient_id FOREIGN KEY (patient_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
