const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { getEnv } = require("./config/env");
const { router } = require("./routes/api");
const { errorHandler } = require("./middleware/errorHandler");

const env = getEnv();
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin.split(",").map((origin) => origin.trim()),
    credentials: false
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "SkillGraph API", status: "online" });
});

app.use("/api", router);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`SkillGraph API listening on port ${env.port}`);
});
