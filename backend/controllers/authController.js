import pool from "../config/db.js";
import pkg from "jsonwebtoken";

const { verify, sign } = pkg;

function generateTokens(user) {
  const accessToken = sign(user, process.env.SESSION_SECRET_KEY, {
    expiresIn: "30m",
  });
  const refreshToken = sign(user, process.env.SESSION_SECRET_KEY, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const request = await pool.query("SELECT user_auth_request($1, $2);", [
      username,
      password,
    ]);
    const userId = request.rows[0].user_auth_request;
    if (userId === "Error: Invalid login or password")
      return res.status(400).json({ detail: "Invalid login or password" });

    await pool.query(`SET app.user_uuid = '${userId}'`);
    const request2 = await pool.query("SELECT role FROM users_pub");
    const userRole = request2.rows[0].role;

    const tokens = generateTokens({ id: userId, role: userRole });
    return res.status(200).json(tokens);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ detail: "Invalid refresh token" });

    verify(refreshToken, process.env.SESSION_SECRET_KEY, (err, user) => {
      if (err) return res.status(400).json({ detail: "Invalid refresh token" });
      const tokens = generateTokens({ id: user.id, role: user.role });
      res.status(200).json(tokens);
    });
  } catch (err) {
    next(err);
  }
};

const role = async (req, res) => {
  return res.status(200).json({ role: req.userRole });
};

export { login, refresh, role };
