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
