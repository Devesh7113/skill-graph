const neo4j = require("neo4j-driver");
const { getEnv } = require("./env");

const env = getEnv();

const driver = neo4j.driver(
  env.cognoUri,
  neo4j.auth.basic(env.cognoUser, env.cognoPassword),
  {
    maxConnectionPoolSize: 20,
    connectionAcquisitionTimeout: 10000
  }
);

async function runQuery(cypher, params = {}) {
  const session = driver.session();

  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

async function verifyConnection() {
  const records = await runQuery("RETURN 1 AS ok");
  return records[0].get("ok").toNumber ? records[0].get("ok").toNumber() : records[0].get("ok");
}

async function closeDriver() {
  await driver.close();
}

module.exports = {
  driver,
  runQuery,
  verifyConnection,
  closeDriver
};
