const express = require("express");
const { verifyConnection } = require("../config/database");
const graph = require("../repositories/graphRepository");

const router = express.Router();

router.get("/health", async (req, res, next) => {
  try {
    await verifyConnection();
    res.json({ ok: true, database: "connected" });
  } catch (err) {
    next(err);
  }
});

router.get("/skills", async (req, res, next) => {
  try {
    res.json(await graph.getAllSkills());
  } catch (err) {
    next(err);
  }
});

router.get("/companies", async (req, res, next) => {
  try {
    res.json(await graph.getAllCompanies());
  } catch (err) {
    next(err);
  }
});

router.get("/candidates/:id", async (req, res, next) => {
  try {
    const candidate = await graph.getCandidate(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    next(err);
  }
});

router.get("/candidates/:id/dashboard", async (req, res, next) => {
  try {
    const dashboard = await graph.getDashboard(req.params.id);
    if (!dashboard) return res.status(404).json({ message: "Candidate not found" });
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
});

router.post("/candidates/:id/skills", async (req, res, next) => {
  try {
    if (!req.body.skillId) {
      return res.status(400).json({ message: "skillId is required" });
    }

    const skill = await graph.addCandidateSkill(req.params.id, req.body.skillId);
    if (!skill) return res.status(404).json({ message: "Candidate or skill not found" });
    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
});

router.delete("/candidates/:id/skills/:skillId", async (req, res, next) => {
  try {
    const skill = await graph.removeCandidateSkill(req.params.id, req.params.skillId);
    if (!skill) return res.status(404).json({ message: "Candidate or skill not found" });
    res.json(skill);
  } catch (err) {
    next(err);
  }
});

router.get("/candidates/:id/recommendations", async (req, res, next) => {
  try {
    res.json(await graph.getRecommendations(req.params.id));
  } catch (err) {
    next(err);
  }
});

router.get("/candidates/:id/skill-gaps/:jobId", async (req, res, next) => {
  try {
    const gap = await graph.getSkillGap(req.params.id, req.params.jobId);
    if (!gap) return res.status(404).json({ message: "Job or candidate not found" });
    res.json(gap);
  } catch (err) {
    next(err);
  }
});

router.post("/companies/:companyId/jobs", async (req, res, next) => {
  try {
    const { title, description, level, skillIds } = req.body;

    if (!title || !description || !Array.isArray(skillIds) || skillIds.length === 0) {
      return res.status(400).json({
        message: "title, description, and at least one required skill are required"
      });
    }

    const job = await graph.createJobForCompany(req.params.companyId, {
      title,
      description,
      level,
      skillIds
    });

    if (!job) return res.status(404).json({ message: "Company not found" });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

router.get("/jobs/:id", async (req, res, next) => {
  try {
    const candidateId = req.query.candidateId || "devesh";
    const job = await graph.getJob(req.params.id, candidateId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.get("/jobs/:id/path/:candidateId", async (req, res, next) => {
  try {
    res.json(await graph.getWhyPath(req.params.candidateId, req.params.id));
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
