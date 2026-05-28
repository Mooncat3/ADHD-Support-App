import pkg from "pg";
import { config } from "dotenv";

config({ override: true });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRE_USER,
  host: process.env.POSTGRE_ADDRESS,
  database: process.env.POSTGRE_DATABASE,
  password: process.env.POSTGRE_PASSWORD,
  port: process.env.POSTGRE_PORT,
});

/**
 * Выполняет callback(client) в рамках одного соединения с установленным
 * app.user_uuid. После завершения — сбрасывает контекст и освобождает
 * соединение, исключая утечку прав между запросами через общий пул.
 *
 * @param {string} userId  UUID пользователя для SET app.user_uuid
 * @param {(client: import('pg').PoolClient) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function withUserContext(userId, callback) {
  const client = await pool.connect();
  try {
    // Параметризованный SET — защита от SQL-инъекции
    await client.query("SELECT set_config($1, $2, false)", [
      "app.user_uuid",
      userId,
    ]);
    return await callback(client);
  } finally {
    // Сбрасываем контекст перед возвратом соединения в пул
    await client.query("RESET app.user_uuid");
    client.release();
  }
}

export default pool;
