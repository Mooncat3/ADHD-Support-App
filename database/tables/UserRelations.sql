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