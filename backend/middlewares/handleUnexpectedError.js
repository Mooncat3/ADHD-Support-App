const handleUnexpectedError = (err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({ detail: "Server error" });
};

export { handleUnexpectedError };
