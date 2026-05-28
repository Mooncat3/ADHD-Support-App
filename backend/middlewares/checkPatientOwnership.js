import pool from "../config/db.js";

/**
 * Middleware: проверяет, что patientId из URL-параметра действительно
 * является пациентом текущего авторизованного врача.
 * Предотвращает IDOR-атаки вида GET /statistic/get/999.
 */
const checkPatientOwnership = async (req, res, next) => {
  const doctorId = req.userId;
  const { patientId } = req.params;

  if (!patientId) return next();

  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT set_config($1, $2, false)", [
        "app.user_uuid",
        doctorId,
      ]);
      const result = await client.query(
        "SELECT 1 FROM patients_pub WHERE id = $1 LIMIT 1",
        [patientId]
      );
      if (result.rowCount === 0) {
        return res
          .status(403)
          .json({ detail: "Access denied: patient does not belong to you" });
      }
    } finally {
      await client.query("RESET app.user_uuid");
      client.release();
    }
    next();
  } catch (err) {
    next(err);
  }
};

export { checkPatientOwnership };
