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

export default pool;
