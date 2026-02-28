export const multerErrorHandler = (err, req, res, next) => {
  console.error("Global error handler:", err.message);

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: "Too many files uploaded!" });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
}