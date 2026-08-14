const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { getEnv } = require("./config/env");
const { router } = require("./routes/api");
const { errorHandler } = require("./middleware/errorHandler");

const env = getEnv();
const app = express();
const allowedOrigins = [
  "https://skill-graph-three.vercel.app",
  ...env.clientOrigin.split(",")
].map((origin) => origin.trim().replace(/\/$/, ""));

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  optionsSuccessStatus: 204
};

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "SkillGraph API", status: "online" });
});

app.use("/api", router);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`SkillGraph API listening on port ${env.port}`);
});
