require("dotenv").config();

const required = ["COGNODB_URI", "COGNODB_USERNAME", "COGNODB_PASSWORD"];

function getEnv() {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    cognoUri: process.env.COGNODB_URI,
    cognoUser: process.env.COGNODB_USERNAME,
    cognoPassword: process.env.COGNODB_PASSWORD,
    port: process.env.PORT || 4000,
    clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  };
}

module.exports = { getEnv };
