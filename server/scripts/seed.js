require("dotenv").config();

const neo4j = require("neo4j-driver");

const uri = process.env.COGNODB_URI;
const user = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !user || !password) {
  console.error("Missing CognoDB environment variables. Check server/.env.");
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const categories = [
  { id: "backend", name: "Backend" },
  { id: "frontend", name: "Frontend" },
  { id: "cloud", name: "Cloud" },
  { id: "data", name: "Data" },
  { id: "ai", name: "AI" },
  { id: "devops", name: "DevOps" }
];

const skills = [
  ["javascript", "JavaScript", "frontend"],
  ["typescript", "TypeScript", "frontend"],
  ["react", "React", "frontend"],
  ["nextjs", "Next.js", "frontend"],
  ["html", "HTML", "frontend"],
  ["css", "CSS", "frontend"],
  ["tailwind", "Tailwind CSS", "frontend"],
  ["node", "Node.js", "backend"],
  ["express", "Express", "backend"],
  ["rest", "REST APIs", "backend"],
  ["graphql", "GraphQL", "backend"],
  ["java", "Java", "backend"],
  ["spring", "Spring Boot", "backend"],
  ["python", "Python", "backend"],
  ["fastapi", "FastAPI", "backend"],
  ["postgres", "PostgreSQL", "data"],
  ["mongodb", "MongoDB", "data"],
  ["neo4j", "Neo4j Driver", "data"],
  ["cypher", "Cypher", "data"],
  ["graph-modeling", "Graph Data Modeling", "data"],
  ["redis", "Redis", "data"],
  ["docker", "Docker", "devops"],
  ["kubernetes", "Kubernetes", "devops"],
  ["github-actions", "GitHub Actions", "devops"],
  ["aws", "AWS", "cloud"],
  ["gcp", "Google Cloud", "cloud"],
  ["vercel", "Vercel", "cloud"],
  ["render", "Render", "cloud"],
  ["testing", "Automated Testing", "devops"],
  ["system-design", "System Design", "backend"],
  ["llm", "LLM APIs", "ai"],
  ["rag", "RAG", "ai"],
  ["vector-db", "Vector Databases", "ai"],
  ["prompting", "Prompt Engineering", "ai"],
  ["auth", "Authentication", "backend"],
  ["security", "Web Security", "backend"],
  ["uiux", "UI/UX", "frontend"],
  ["charts", "Data Visualization", "frontend"],
  ["websockets", "WebSockets", "backend"],
  ["microservices", "Microservices", "backend"],
  ["observability", "Observability", "devops"],
  ["ci-cd", "CI/CD", "devops"]
].map(([id, name, categoryId]) => ({ id, name, categoryId }));

const candidates = [
  {
    id: "devesh",
    name: "Devesh Yadav",
    title: "Full-Stack Engineer",
    location: "India",
    summary: "Backend-leaning full-stack engineer exploring graph-powered product experiences.",
    skillIds: ["java", "spring", "javascript", "react", "node", "express", "postgres", "docker", "rest", "system-design", "html", "css"]
  },
  {
    id: "maya",
    name: "Maya Shah",
    title: "Frontend Engineer",
    location: "India",
    summary: "Frontend specialist with strong UI systems and data visualization experience.",
    skillIds: ["javascript", "typescript", "react", "nextjs", "tailwind", "uiux", "charts", "html", "css"]
  },
  {
    id: "arjun",
    name: "Arjun Mehta",
    title: "AI Platform Engineer",
    location: "India",
    summary: "AI engineer focused on LLM apps, RAG pipelines, and cloud deployment.",
    skillIds: ["python", "fastapi", "llm", "rag", "vector-db", "aws", "docker", "postgres", "rest"]
  }
];

const companies = [
  ["novatech", "NovaTech", "B2B SaaS"],
  ["orbitlabs", "OrbitLabs", "AI Productivity"],
  ["cloudnest", "CloudNest", "Cloud Infrastructure"],
  ["finpulse", "FinPulse", "Fintech"],
  ["learnloop", "LearnLoop", "Edtech"],
  ["caregrid", "CareGrid", "Healthtech"],
  ["shopbeam", "ShopBeam", "Commerce"],
  ["datacraft", "DataCraft", "Analytics"],
  ["hirewise", "HireWise", "Recruiting"],
  ["securepath", "SecurePath", "Cybersecurity"]
].map(([id, name, industry]) => ({ id, name, industry }));

const jobs = [
  ["backend-engineer", "Backend Engineer", "Build APIs and services for workflow automation.", "Mid", "novatech", ["node", "express", "postgres", "docker", "rest", "system-design"]],
  ["full-stack-engineer", "Full-Stack Engineer", "Own product features across React and Node services.", "Mid", "orbitlabs", ["javascript", "typescript", "react", "node", "express", "postgres", "uiux"]],
  ["java-platform-engineer", "Java Platform Engineer", "Design scalable backend services in Java and Spring Boot.", "Mid", "finpulse", ["java", "spring", "postgres", "docker", "system-design", "testing"]],
  ["graph-app-engineer", "Graph Application Engineer", "Build graph-powered search and recommendations.", "Mid", "hirewise", ["node", "neo4j", "cypher", "graph-modeling", "react", "system-design"]],
  ["ai-full-stack-engineer", "AI Full-Stack Engineer", "Ship LLM features inside a collaborative web app.", "Mid", "orbitlabs", ["react", "node", "llm", "rag", "postgres", "prompting"]],
  ["frontend-engineer", "Frontend Engineer", "Create fast, polished product interfaces.", "Mid", "shopbeam", ["javascript", "typescript", "react", "tailwind", "uiux", "testing"]],
  ["cloud-backend-engineer", "Cloud Backend Engineer", "Build cloud-native APIs and deployment workflows.", "Mid", "cloudnest", ["node", "aws", "docker", "kubernetes", "ci-cd", "observability"]],
  ["data-platform-engineer", "Data Platform Engineer", "Build internal data tools and analytics APIs.", "Mid", "datacraft", ["python", "postgres", "mongodb", "docker", "rest", "charts"]],
  ["devops-engineer", "DevOps Engineer", "Improve CI/CD, reliability, and cloud operations.", "Mid", "cloudnest", ["docker", "kubernetes", "github-actions", "aws", "observability", "ci-cd"]],
  ["security-engineer", "Web Security Engineer", "Harden APIs, auth flows, and platform controls.", "Mid", "securepath", ["node", "auth", "security", "testing", "system-design"]],
  ["react-dashboard-engineer", "React Dashboard Engineer", "Build analytics-heavy dashboards for operators.", "Mid", "datacraft", ["react", "typescript", "charts", "uiux", "rest"]],
  ["healthtech-fullstack", "Healthtech Full-Stack Engineer", "Develop scheduling and care coordination tools.", "Mid", "caregrid", ["react", "node", "postgres", "auth", "rest"]],
  ["edtech-product-engineer", "Edtech Product Engineer", "Build learning paths and recommendation features.", "Mid", "learnloop", ["react", "node", "graph-modeling", "postgres", "uiux"]],
  ["api-integration-engineer", "API Integration Engineer", "Integrate third-party APIs and internal services.", "Mid", "novatech", ["node", "rest", "websockets", "testing", "docker"]],
  ["llm-backend-engineer", "LLM Backend Engineer", "Build backend services for AI assistants.", "Mid", "orbitlabs", ["python", "fastapi", "llm", "rag", "vector-db", "aws"]],
  ["commerce-platform-engineer", "Commerce Platform Engineer", "Build reliable commerce platform services.", "Mid", "shopbeam", ["java", "spring", "postgres", "redis", "system-design"]],
  ["neo4j-consultant", "Graph Data Consultant", "Model relationship-heavy business domains.", "Senior", "hirewise", ["neo4j", "cypher", "graph-modeling", "system-design"]],
  ["platform-sre", "Platform SRE", "Keep production systems observable and reliable.", "Senior", "cloudnest", ["kubernetes", "observability", "aws", "ci-cd", "docker"]],
  ["product-ui-engineer", "Product UI Engineer", "Own frontend quality and interaction design.", "Mid", "learnloop", ["react", "typescript", "uiux", "tailwind", "testing"]],
  ["realtime-engineer", "Realtime Collaboration Engineer", "Build realtime collaboration features.", "Mid", "caregrid", ["node", "websockets", "redis", "react", "system-design"]],
  ["python-api-engineer", "Python API Engineer", "Build clean APIs for analytics workflows.", "Mid", "datacraft", ["python", "fastapi", "postgres", "docker", "rest"]],
  ["fintech-backend", "Fintech Backend Engineer", "Build secure transaction services.", "Mid", "finpulse", ["java", "spring", "security", "postgres", "testing"]],
  ["cloud-deployment-engineer", "Deployment Engineer", "Improve deployment workflows for customer apps.", "Mid", "render", ["render", "vercel", "github-actions", "ci-cd", "docker"]],
  ["nextjs-engineer", "Next.js Engineer", "Build customer-facing web experiences.", "Mid", "shopbeam", ["nextjs", "react", "typescript", "tailwind", "uiux"]],
  ["ai-product-engineer", "AI Product Engineer", "Turn AI workflows into practical product features.", "Mid", "learnloop", ["react", "node", "llm", "prompting", "uiux"]],
  ["database-engineer", "Database Engineer", "Improve query performance and data modeling.", "Mid", "datacraft", ["postgres", "mongodb", "neo4j", "cypher", "system-design"]],
  ["microservices-engineer", "Microservices Engineer", "Split and maintain backend services.", "Senior", "novatech", ["java", "spring", "microservices", "docker", "kubernetes"]],
  ["auth-platform-engineer", "Auth Platform Engineer", "Build identity and access systems.", "Mid", "securepath", ["auth", "security", "node", "postgres", "testing"]],
  ["visualization-engineer", "Visualization Engineer", "Create graph and analytics visualizations.", "Mid", "hirewise", ["react", "charts", "cypher", "graph-modeling", "uiux"]],
  ["growth-fullstack", "Growth Full-Stack Engineer", "Build fast experiments across product funnels.", "Mid", "shopbeam", ["react", "node", "postgres", "vercel", "uiux"]]
].map(([id, title, description, level, companyId, skillIds]) => ({ id, title, description, level, companyId, skillIds }));

const relatedSkills = [
  ["java", "spring", 0.95],
  ["javascript", "typescript", 0.88],
  ["javascript", "node", 0.85],
  ["node", "express", 0.95],
  ["react", "nextjs", 0.82],
  ["html", "css", 0.9],
  ["css", "tailwind", 0.75],
  ["postgres", "cypher", 0.45],
  ["neo4j", "cypher", 0.95],
  ["cypher", "graph-modeling", 0.92],
  ["docker", "kubernetes", 0.72],
  ["github-actions", "ci-cd", 0.9],
  ["aws", "kubernetes", 0.65],
  ["llm", "rag", 0.9],
  ["rag", "vector-db", 0.86],
  ["python", "fastapi", 0.83],
  ["rest", "graphql", 0.55],
  ["auth", "security", 0.8],
  ["charts", "uiux", 0.68],
  ["observability", "ci-cd", 0.5]
];

function importanceFor(index) {
  return index < 2 ? "high" : index < 4 ? "medium" : "nice-to-have";
}

async function seed() {
  const session = driver.session();

  try {
    await session.run("MATCH (n) DETACH DELETE n");

    await session.run("CREATE CONSTRAINT candidate_id IF NOT EXISTS FOR (n:Candidate) REQUIRE n.id IS UNIQUE");
    await session.run("CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (n:Skill) REQUIRE n.id IS UNIQUE");
    await session.run("CREATE CONSTRAINT job_id IF NOT EXISTS FOR (n:Job) REQUIRE n.id IS UNIQUE");
    await session.run("CREATE CONSTRAINT company_id IF NOT EXISTS FOR (n:Company) REQUIRE n.id IS UNIQUE");
    await session.run("CREATE CONSTRAINT category_id IF NOT EXISTS FOR (n:Category) REQUIRE n.id IS UNIQUE");

    await session.run(
      `
      UNWIND $categories AS category
      MERGE (c:Category {id: category.id})
      SET c.name = category.name
      `,
      { categories }
    );

    await session.run(
      `
      UNWIND $skills AS skill
      MATCH (category:Category {id: skill.categoryId})
      MERGE (s:Skill {id: skill.id})
      SET s.name = skill.name
      MERGE (s)-[:BELONGS_TO]->(category)
      `,
      { skills }
    );

    await session.run(
      `
      UNWIND $companies AS company
      MERGE (c:Company {id: company.id})
      SET c.name = company.name,
          c.industry = company.industry
      `,
      { companies }
    );

    await session.run(
      `
      UNWIND $jobs AS job
      MATCH (company:Company {id: job.companyId})
      MERGE (j:Job {id: job.id})
      SET j.title = job.title,
          j.description = job.description,
          j.level = job.level
      MERGE (company)-[:OFFERS]->(j)
      WITH j, job
      UNWIND range(0, size(job.skillIds) - 1) AS idx
      MATCH (skill:Skill {id: job.skillIds[idx]})
      MERGE (j)-[r:REQUIRES]->(skill)
      SET r.importance = CASE WHEN idx < 2 THEN "high" WHEN idx < 4 THEN "medium" ELSE "nice-to-have" END
      `,
      { jobs }
    );

    await session.run(
      `
      UNWIND $candidates AS candidate
      MERGE (c:Candidate {id: candidate.id})
      SET c.name = candidate.name,
          c.title = candidate.title,
          c.location = candidate.location,
          c.summary = candidate.summary
      WITH c, candidate
      UNWIND candidate.skillIds AS skillId
      MATCH (skill:Skill {id: skillId})
      MERGE (c)-[:HAS_SKILL]->(skill)
      `,
      { candidates }
    );

    await session.run(
      `
      UNWIND $relatedSkills AS pair
      MATCH (a:Skill {id: pair[0]})
      MATCH (b:Skill {id: pair[1]})
      MERGE (a)-[r:RELATED_TO]-(b)
      SET r.strength = pair[2]
      `,
      { relatedSkills }
    );

    const count = await session.run(
      `
      MATCH (n)
      OPTIONAL MATCH ()-[r]->()
      RETURN count(DISTINCT n) AS nodes, count(DISTINCT r) AS relationships
      `
    );

    const summary = count.records[0];
    console.log(`Seed complete: ${summary.get("nodes").toNumber()} nodes, ${summary.get("relationships").toNumber()} relationships.`);
    console.log("Default candidate id: devesh");
    console.log("Example job id: graph-app-engineer");
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
