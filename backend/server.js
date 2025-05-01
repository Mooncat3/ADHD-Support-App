import express from "express";
import cors from "cors";
import "jsonwebtoken";
import router from "./routes/index.js";
import pool from "./config/db.js";

const port = process.env.SERVER_PORT || 3000;
const address = process.env.SERVER_ADDRESS || 'localhost';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(process.env.MAIN_API_URL, router);

// Check pool connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) console.error("Error connecting to the database", err.stack);
  else console.log("Connected to the database:", res.rows);
});

const server = app.listen(port, address, () => {
  console.log(
    `Server listening on ${server.address().address}:${server.address().port}`
  );
});

export default server;
