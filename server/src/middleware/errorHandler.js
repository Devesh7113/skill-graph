function errorHandler(err, req, res, next) {
  console.error(err);

  const isDatabaseError =
    err.code ||
    err.name === "Neo4jError" ||
    String(err.message || "").toLowerCase().includes("database") ||
    String(err.message || "").toLowerCase().includes("bolt");

  if (isDatabaseError) {
    return res.status(503).json({
      message: "SkillGraph cannot reach CognoDB right now. Check database credentials and instance status.",
      detail: process.env.NODE_ENV === "production" ? undefined : err.message
    });
  }

  return res.status(err.status || 500).json({
    message: err.message || "Unexpected server error"
  });
}

module.exports = { errorHandler };
