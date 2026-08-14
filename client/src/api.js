const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "Request failed");
  }

  return body;
}

export function getHealth() {
  return request("/api/health");
}

export function getDashboard(candidateId) {
  return request(`/api/candidates/${candidateId}/dashboard`);
}

export function getSkills() {
  return request("/api/skills");
}

export function getCompanies() {
  return request("/api/companies");
}

export function addCandidateSkill(candidateId, skillId) {
  return request(`/api/candidates/${candidateId}/skills`, {
    method: "POST",
    body: JSON.stringify({ skillId })
  });
}

export function removeCandidateSkill(candidateId, skillId) {
  return request(`/api/candidates/${candidateId}/skills/${skillId}`, {
    method: "DELETE"
  });
}

export function getRecommendations(candidateId) {
  return request(`/api/candidates/${candidateId}/recommendations`);
}

export function getJob(jobId, candidateId) {
  return request(`/api/jobs/${jobId}?candidateId=${candidateId}`);
}

export function getWhyPath(jobId, candidateId) {
  return request(`/api/jobs/${jobId}/path/${candidateId}`);
}

export function createCompanyJob(companyId, job) {
  return request(`/api/companies/${companyId}/jobs`, {
    method: "POST",
    body: JSON.stringify(job)
  });
}
