-- Создание таблицы UserStatistic
CREATE TABLE UserStatistic (
    stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    timestamp TIMESTAMPTZ CHECK (timestamp BETWEEN '2025-01-01' AND '2200-01-01') NOT NULL,
    data JSON NOT NULL CHECK (LENGTH(data::TEXT) <= 1048576),
    CONSTRAINT fk_user_stat FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

ALTER TABLE UserStatistic
ADD CONSTRAINT userstat_unique UNIQUE(user_id, timestamp);
