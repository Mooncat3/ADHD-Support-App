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