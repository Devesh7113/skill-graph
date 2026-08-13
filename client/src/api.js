const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
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

export function getRecommendations(candidateId) {
  return request(`/api/candidates/${candidateId}/recommendations`);
}

export function getJob(jobId, candidateId) {
  return request(`/api/jobs/${jobId}?candidateId=${candidateId}`);
}

export function getWhyPath(jobId, candidateId) {
  return request(`/api/jobs/${jobId}/path/${candidateId}`);
}
