import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Database,
  GitBranch,
  Loader2,
  MapPin,
  Network,
  Plus,
  Search,
  Sparkles,
  UserRound,
  XCircle
} from "lucide-react";
import {
  addCandidateSkill,
  createCompanyJob,
  getCompanies,
  getDashboard,
  getHealth,
  getJob,
  getRecommendations,
  getSkills,
  getWhyPath,
  removeCandidateSkill
} from "./api";

const CANDIDATE_ID = "devesh";

export function App() {
  const [dashboard, setDashboard] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [whyPath, setWhyPath] = useState([]);
  const [skills, setSkills] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function refreshData(nextSelectedJobId = selectedJobId) {
    const [dashboardData, recommendationData, skillData, companyData] = await Promise.all([
      getDashboard(CANDIDATE_ID),
      getRecommendations(CANDIDATE_ID),
      getSkills(),
      getCompanies()
    ]);

    setDashboard(dashboardData);
    setRecommendations(recommendationData);
    setSkills(skillData);
    setCompanies(companyData);

    const fallbackJobId = recommendationData[0]?.job?.id || null;
    const stillExists = recommendationData.some((item) => item.job.id === nextSelectedJobId);
    setSelectedJobId(stillExists ? nextSelectedJobId : fallbackJobId);
  }

  useEffect(() => {
    async function load() {
      try {
        setStatus("loading");
        await getHealth();
        await refreshData(null);
        setStatus("ready");
      } catch (err) {
        setError(err.message);
        setStatus("error");
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function loadJob() {
      if (!selectedJobId) return;

      try {
        const [jobData, pathData] = await Promise.all([
          getJob(selectedJobId, CANDIDATE_ID),
          getWhyPath(selectedJobId, CANDIDATE_ID)
        ]);
        setSelectedJob(jobData);
        setWhyPath(pathData);
      } catch (err) {
        setError(err.message);
      }
    }

    loadJob();
  }, [selectedJobId]);

  const selectedRecommendation = useMemo(
    () => recommendations.find((item) => item.job.id === selectedJobId),
    [recommendations, selectedJobId]
  );

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "error") {
    return <ErrorScreen message={error} />;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">
            <Network size={28} />
            <span>SkillGraph</span>
          </div>
          <p>Graph-powered job recommendations for relationship-heavy skill matching.</p>
        </div>
        <div className="database-pill">
          <Database size={16} />
          CognoDB connected
        </div>
      </header>

      <section className="hero-grid">
        <CandidatePanel dashboard={dashboard} />
        <SummaryPanel dashboard={dashboard} recommendations={recommendations} />
      </section>

      <ActionPanel
        dashboard={dashboard}
        skills={skills}
        companies={companies}
        actionMessage={actionMessage}
        onAddSkill={async (skillId) => {
          await addCandidateSkill(CANDIDATE_ID, skillId);
          setActionMessage("Skill added. Recommendations refreshed.");
          await refreshData(selectedJobId);
        }}
        onRemoveSkill={async (skillId) => {
          await removeCandidateSkill(CANDIDATE_ID, skillId);
          setActionMessage("Skill removed. Recommendations refreshed.");
          await refreshData(selectedJobId);
        }}
        onCreateJob={async (companyId, job) => {
          const created = await createCompanyJob(companyId, job);
          setActionMessage("Job added to the graph. Recommendations refreshed.");
          await refreshData(created.job.id);
        }}
      />

      <section className="workspace-grid">
        <Recommendations
          recommendations={recommendations}
          selectedJobId={selectedJobId}
          onSelect={setSelectedJobId}
        />
        <JobDetail
          selectedJob={selectedJob}
          recommendation={selectedRecommendation}
          whyPath={whyPath}
        />
      </section>
    </main>
  );
}

function ActionPanel({ dashboard, skills, companies, actionMessage, onAddSkill, onRemoveSkill, onCreateJob }) {
  return (
    <section className="action-grid">
      <SkillManager
        ownedSkills={dashboard?.skills || []}
        allSkills={skills}
        onAddSkill={onAddSkill}
        onRemoveSkill={onRemoveSkill}
      />
      <JobCreator companies={companies} skills={skills} onCreateJob={onCreateJob} />
      {actionMessage && <div className="action-message">{actionMessage}</div>}
    </section>
  );
}

function SkillManager({ ownedSkills, allSkills, onAddSkill, onRemoveSkill }) {
  const [skillId, setSkillId] = useState("");
  const ownedIds = new Set(ownedSkills.map((skill) => skill.id));
  const availableSkills = allSkills.filter((skill) => !ownedIds.has(skill.id));

  async function handleAdd(event) {
    event.preventDefault();
    if (!skillId) return;
    await onAddSkill(skillId);
    setSkillId("");
  }

  return (
    <article className="panel control-panel">
      <div className="panel-heading">
        <UserRound size={20} />
        <span>Edit Candidate Skills</span>
      </div>
      <form className="inline-form" onSubmit={handleAdd}>
        <select value={skillId} onChange={(event) => setSkillId(event.target.value)}>
          <option value="">Choose a skill to add</option>
          {availableSkills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name} ({skill.category})
            </option>
          ))}
        </select>
        <button type="submit">
          <Plus size={16} />
          Add
        </button>
      </form>
      <div className="editable-chip-list">
        {ownedSkills.map((skill) => (
          <button key={skill.id} onClick={() => onRemoveSkill(skill.id)} title={`Remove ${skill.name}`}>
            {skill.name}
            <XCircle size={14} />
          </button>
        ))}
      </div>
    </article>
  );
}

function JobCreator({ companies, skills, onCreateJob }) {
  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    if (!companyId && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companies, companyId]);

  function toggleSkill(skillId) {
    setSelectedSkills((current) =>
      current.includes(skillId) ? current.filter((id) => id !== skillId) : [...current, skillId]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!companyId || !title.trim() || !description.trim() || selectedSkills.length === 0) return;

    await onCreateJob(companyId, {
      title: title.trim(),
      description: description.trim(),
      level: "Mid",
      skillIds: selectedSkills
    });

    setTitle("");
    setDescription("");
    setSelectedSkills([]);
  }

  return (
    <article className="panel control-panel">
      <div className="panel-heading">
        <Building2 size={20} />
        <span>Add Company Job</span>
      </div>
      <form className="job-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <select value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Job title" />
        </div>
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short job description"
        />
        <div className="skill-picker">
          {skills.slice(0, 24).map((skill) => (
            <button
              key={skill.id}
              type="button"
              className={selectedSkills.includes(skill.id) ? "selected" : ""}
              onClick={() => toggleSkill(skill.id)}
            >
              {skill.name}
            </button>
          ))}
        </div>
        <button className="primary-action" type="submit">
          <Plus size={16} />
          Create Job
        </button>
      </form>
    </article>
  );
}

function LoadingScreen() {
  return (
    <div className="center-screen">
      <Loader2 className="spin" size={34} />
      <h1>Loading SkillGraph</h1>
      <p>Connecting to CognoDB and scoring job paths.</p>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="center-screen error">
      <AlertCircle size={36} />
      <h1>Database unavailable</h1>
      <p>{message}</p>
      <span>Check CognoDB credentials, instance status, and backend environment variables.</span>
    </div>
  );
}

function CandidatePanel({ dashboard }) {
  const candidate = dashboard?.candidate;

  return (
    <article className="panel candidate-panel">
      <div className="panel-heading">
        <UserRound size={20} />
        <span>Candidate Profile</span>
      </div>
      <div className="candidate-main">
        <div className="avatar">DY</div>
        <div>
          <h1>{candidate?.name}</h1>
          <p>{candidate?.title}</p>
          <div className="muted-line">
            <MapPin size={14} />
            {candidate?.location}
          </div>
        </div>
      </div>
      <p className="summary-text">{candidate?.summary}</p>
      <div className="skill-cloud">
        {dashboard?.skills?.map((skill) => (
          <span key={skill.id}>{skill.name}</span>
        ))}
      </div>
    </article>
  );
}

function SummaryPanel({ dashboard, recommendations }) {
  const topMatch = recommendations[0];
  const companyCount = dashboard?.companies?.length || 0;

  return (
    <article className="panel summary-panel">
      <div className="panel-heading">
        <Sparkles size={20} />
        <span>Recommendation Snapshot</span>
      </div>
      <div className="metric-grid">
        <Metric label="Skills" value={dashboard?.skills?.length || 0} />
        <Metric label="Jobs scored" value={recommendations.length} />
        <Metric label="Companies" value={companyCount} />
      </div>
      {topMatch ? (
        <div className="top-match">
          <span>Best current match</span>
          <strong>{topMatch.job.title}</strong>
          <p>{topMatch.company.name} - {topMatch.matchPercent}% match</p>
        </div>
      ) : (
        <EmptyState label="No recommendations yet" />
      )}
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Recommendations({ recommendations, selectedJobId, onSelect }) {
  return (
    <section className="panel recommendations-panel">
      <div className="section-title">
        <div>
          <div className="panel-heading">
            <BriefcaseBusiness size={20} />
            <span>Ranked Recommendations</span>
          </div>
          <p>Jobs are scored by direct skill coverage, then explained with graph paths.</p>
        </div>
        <Search size={20} />
      </div>

      {recommendations.length === 0 ? (
        <EmptyState label="No matching jobs found" />
      ) : (
        <div className="recommendation-list">
          {recommendations.map((item) => (
            <button
              key={item.job.id}
              className={`job-row ${selectedJobId === item.job.id ? "active" : ""}`}
              onClick={() => onSelect(item.job.id)}
            >
              <div className="score-ring" style={{ "--score": `${item.matchPercent}%` }}>
                <span>{item.matchPercent}%</span>
              </div>
              <div className="job-row-copy">
                <strong>{item.job.title}</strong>
                <span>
                  {item.company.name} - {item.job.level} - {item.matchedSkills.length} of{" "}
                  {item.requiredSkills.length} skills matched
                </span>
              </div>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function JobDetail({ selectedJob, recommendation, whyPath }) {
  if (!selectedJob || !recommendation) {
    return (
      <section className="panel detail-panel">
        <EmptyState label="Select a job to inspect the graph path" />
      </section>
    );
  }

  return (
    <section className="panel detail-panel">
      <div className="job-detail-header">
        <div>
          <div className="panel-heading">
            <Building2 size={20} />
            <span>{selectedJob.company.name}</span>
          </div>
          <h2>{selectedJob.job.title}</h2>
          <p>{selectedJob.job.description}</p>
        </div>
        <div className="large-score">
          <strong>{recommendation.matchPercent}%</strong>
          <span>match</span>
        </div>
      </div>

      <div className="gap-grid">
        <SkillColumn
          title="Matched Skills"
          icon={<CheckCircle2 size={18} />}
          skills={selectedJob.matchedSkills}
          tone="good"
        />
        <SkillColumn
          title="Missing Skills"
          icon={<XCircle size={18} />}
          skills={selectedJob.missingSkills}
          tone="missing"
        />
      </div>

      <div className="path-section">
        <div className="panel-heading">
          <GitBranch size={20} />
          <span>Why This Job?</span>
        </div>
        {whyPath.length === 0 ? (
          <EmptyState label="No explanation path found" />
        ) : (
          <div className="path-list">
            {whyPath.map((path, index) => (
              <GraphPath key={`${path.ownedSkill.id}-${path.requiredSkill.id}-${index}`} path={path} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SkillColumn({ title, icon, skills, tone }) {
  return (
    <div className={`skill-column ${tone}`}>
      <div className="skill-column-title">
        {icon}
        <span>{title}</span>
      </div>
      <div className="skill-stack">
        {skills.length === 0 ? (
          <span className="empty-chip">None</span>
        ) : (
          skills.map((skill) => <span key={skill.id}>{skill.name}</span>)
        )}
      </div>
    </div>
  );
}

function GraphPath({ path }) {
  const related = path.reason === "RELATED_SKILL";

  return (
    <div className="graph-path">
      <PathNode label={path.candidate.name} meta="Candidate" />
      <PathEdge label="HAS_SKILL" />
      <PathNode label={path.ownedSkill.name} meta="Owned skill" />
      {related && (
        <>
          <PathEdge label="RELATED_TO" />
          <PathNode label={path.requiredSkill.name} meta="Required skill" />
        </>
      )}
      {!related && <PathEdge label="REQUIRED_BY" />}
      {related && <PathEdge label="REQUIRED_BY" />}
      <PathNode label={path.job.title} meta="Job" />
      <PathEdge label="OFFERED_BY" />
      <PathNode label={path.company.name} meta="Company" />
    </div>
  );
}

function PathNode({ label, meta }) {
  return (
    <div className="path-node">
      <strong>{label}</strong>
      <span>{meta}</span>
    </div>
  );
}

function PathEdge({ label }) {
  return (
    <div className="path-edge">
      <ArrowRight size={16} />
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="empty-state">
      <span>{label}</span>
    </div>
  );
}
