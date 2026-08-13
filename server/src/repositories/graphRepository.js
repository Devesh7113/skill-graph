const { runQuery } = require("../config/database");
const { nodeProps, toNative } = require("../utils/neo4j");

async function getCandidate(candidateId) {
  const records = await runQuery(
    `
    MATCH (candidate:Candidate {id: $candidateId})
    OPTIONAL MATCH (candidate)-[:HAS_SKILL]->(skill:Skill)-[:BELONGS_TO]->(category:Category)
    RETURN candidate, collect(DISTINCT skill {.*, category: category.name}) AS skills
    `,
    { candidateId }
  );

  if (records.length === 0) return null;
  return {
    ...nodeProps(records[0].get("candidate")),
    skills: toNative(records[0].get("skills"))
  };
}

async function getDashboard(candidateId) {
  const records = await runQuery(
    `
    MATCH (candidate:Candidate {id: $candidateId})
    OPTIONAL MATCH (candidate)-[:HAS_SKILL]->(skill:Skill)
    WITH candidate, collect(DISTINCT skill) AS skills
    OPTIONAL MATCH (candidate)-[:HAS_SKILL]->(matched:Skill)<-[:REQUIRES]-(job:Job)<-[:OFFERS]-(company:Company)
    WITH candidate, skills, job, company, count(DISTINCT matched) AS matchedCount
    ORDER BY matchedCount DESC
    RETURN candidate,
      skills,
      collect(DISTINCT company) AS companies,
      collect(CASE WHEN job IS NULL THEN null ELSE job {.*, company: company.name, matchedCount: matchedCount} END)[0..5] AS topJobs
    `,
    { candidateId }
  );

  if (records.length === 0) return null;

  return {
    candidate: nodeProps(records[0].get("candidate")),
    skills: toNative(records[0].get("skills")).map(nodeProps),
    companies: toNative(records[0].get("companies")).map(nodeProps),
    topJobs: toNative(records[0].get("topJobs")).filter(Boolean)
  };
}

async function getRecommendations(candidateId) {
  const records = await runQuery(
    `
    MATCH (candidate:Candidate {id: $candidateId})
    MATCH (job:Job)-[:REQUIRES]->(required:Skill)
    MATCH (company:Company)-[:OFFERS]->(job)
    OPTIONAL MATCH (candidate)-[:HAS_SKILL]->(direct:Skill)
    WITH candidate, job, company, collect(DISTINCT required) AS requiredSkills, collect(DISTINCT direct) AS candidateSkills
    WITH candidate, job, company, requiredSkills,
      [skill IN requiredSkills WHERE skill IN candidateSkills] AS matchedSkills,
      [skill IN requiredSkills WHERE NOT skill IN candidateSkills] AS missingSkills
    WITH job, company, requiredSkills, matchedSkills, missingSkills,
      CASE WHEN size(requiredSkills) = 0 THEN 0 ELSE round((toFloat(size(matchedSkills)) / size(requiredSkills)) * 100) END AS matchPercent
    RETURN job, company, requiredSkills, matchedSkills, missingSkills, matchPercent
    ORDER BY matchPercent DESC, size(matchedSkills) DESC, job.title ASC
    `,
    { candidateId }
  );

  return records.map((record) => ({
    job: nodeProps(record.get("job")),
    company: nodeProps(record.get("company")),
    requiredSkills: toNative(record.get("requiredSkills")).map(nodeProps),
    matchedSkills: toNative(record.get("matchedSkills")).map(nodeProps),
    missingSkills: toNative(record.get("missingSkills")).map(nodeProps),
    matchPercent: toNative(record.get("matchPercent"))
  }));
}

async function getJob(jobId, candidateId) {
  const records = await runQuery(
    `
    MATCH (job:Job {id: $jobId})<-[:OFFERS]-(company:Company)
    OPTIONAL MATCH (job)-[:REQUIRES]->(required:Skill)
    WITH job, company, collect(DISTINCT required) AS requiredSkills
    OPTIONAL MATCH (:Candidate {id: $candidateId})-[:HAS_SKILL]->(owned:Skill)
    WITH job, company, requiredSkills, collect(DISTINCT owned) AS ownedSkills
    RETURN job,
      company,
      requiredSkills,
      [skill IN requiredSkills WHERE skill IN ownedSkills] AS matchedSkills,
      [skill IN requiredSkills WHERE NOT skill IN ownedSkills] AS missingSkills
    `,
    { jobId, candidateId }
  );

  if (records.length === 0) return null;

  return {
    job: nodeProps(records[0].get("job")),
    company: nodeProps(records[0].get("company")),
    requiredSkills: toNative(records[0].get("requiredSkills")).map(nodeProps),
    matchedSkills: toNative(records[0].get("matchedSkills")).map(nodeProps),
    missingSkills: toNative(records[0].get("missingSkills")).map(nodeProps)
  };
}

async function getSkillGap(candidateId, jobId) {
  const records = await runQuery(
    `
    MATCH (job:Job {id: $jobId})
    OPTIONAL MATCH (job)-[:REQUIRES]->(required:Skill)
    WITH job, collect(DISTINCT required) AS requiredSkills
    OPTIONAL MATCH (:Candidate {id: $candidateId})-[:HAS_SKILL]->(owned:Skill)
    WITH job, requiredSkills, collect(DISTINCT owned) AS ownedSkills
    RETURN job,
      [skill IN requiredSkills WHERE skill IN ownedSkills] AS matchedSkills,
      [skill IN requiredSkills WHERE NOT skill IN ownedSkills] AS missingSkills
    `,
    { candidateId, jobId }
  );

  if (records.length === 0) return null;

  return {
    job: nodeProps(records[0].get("job")),
    matchedSkills: toNative(records[0].get("matchedSkills")).map(nodeProps),
    missingSkills: toNative(records[0].get("missingSkills")).map(nodeProps)
  };
}

async function getWhyPath(candidateId, jobId) {
  const records = await runQuery(
    `
    MATCH (candidate:Candidate {id: $candidateId})
    MATCH (job:Job {id: $jobId})<-[:OFFERS]-(company:Company)
    MATCH (candidate)-[:HAS_SKILL]->(owned:Skill)<-[:REQUIRES]-(job)
    RETURN candidate, owned, owned AS required, job, company, "DIRECT_MATCH" AS reason
    UNION
    MATCH (candidate:Candidate {id: $candidateId})
    MATCH (job:Job {id: $jobId})<-[:OFFERS]-(company:Company)
    MATCH (candidate)-[:HAS_SKILL]->(owned:Skill)-[:RELATED_TO]-(required:Skill)<-[:REQUIRES]-(job)
    WHERE owned.id <> required.id
    RETURN candidate, owned, required, job, company, "RELATED_SKILL" AS reason
    LIMIT 8
    `,
    { candidateId, jobId }
  );

  return records.map((record) => ({
    candidate: nodeProps(record.get("candidate")),
    ownedSkill: nodeProps(record.get("owned")),
    requiredSkill: nodeProps(record.get("required")),
    job: nodeProps(record.get("job")),
    company: nodeProps(record.get("company")),
    reason: record.get("reason")
  }));
}

module.exports = {
  getCandidate,
  getDashboard,
  getRecommendations,
  getJob,
  getSkillGap,
  getWhyPath
};
