# SkillGraph Deployment Checklist

Use Node 20 for local work and hosting.

```bash
nvm install 20
nvm use 20
```

## 1. GitHub

Create a new GitHub repository named:

```text
skill-graph
```

Then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/skill-graph.git
git branch -M main
git push -u origin main
```

## 2. Render Backend

Create a new Render Web Service from the GitHub repo.

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Node version: `20`

Add environment variables:

```text
COGNODB_URI=bolt+s://db-7a664208.databases.cognodb.com
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<your-password>
CLIENT_ORIGIN=<your-vercel-url>
```

After deploy, test:

```text
https://your-render-service.onrender.com/api/health
```

## 3. Vercel Frontend

Create a new Vercel project from the same GitHub repo.

- Root directory: `client`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Add environment variable:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Redeploy after adding the variable.

## 4. Screen Recording

Record 2-4 minutes:

1. Open the hosted app.
2. Show Devesh's profile and skills.
3. Show ranked recommendations.
4. Select `Graph Application Engineer`.
5. Show matched skills and missing skills.
6. Show the "Why This Job?" graph path.
7. Mention that the backend uses parameterized Cypher through Neo4j's official JavaScript driver.

## 5. Submission Email

Subject:

```text
CognoDB Assignment 2 - Devesh Yadav
```

Body:

```text
Dear Wexa AI Recruitment Team,

Please find my completed CognoDB take-home assignment below.

GitHub repository: <repo-url>
Hosted demo: <vercel-url>
Screen recording: <recording-url>

The application is SkillGraph, a graph-backed job recommendation app that uses CognoDB with the official Neo4j JavaScript driver.

Best regards,
Devesh Yadav
deveshyadav7113@gmail.com
```
