# Architecture Notes

This project is intentionally small and beginner-friendly.

## Backend Flow

```text
HTTP request
  -> server/src/routes/api.js
  -> server/src/repositories/graphRepository.js
  -> CognoDB through neo4j-driver
  -> JSON response
```

If you know Spring Boot:

- `routes/api.js` is similar to a Controller.
- `graphRepository.js` is similar to a Repository.
- `config/database.js` is similar to database configuration.
- `scripts/seed.js` is similar to a data initializer.

There are no microservices, no auth, no message queue, and no hidden framework magic.

## Important Files

- `server/scripts/seed.js`: creates all graph data.
- `server/src/repositories/graphRepository.js`: contains all Cypher queries.
- `server/src/routes/api.js`: exposes REST endpoints.
- `client/src/App.jsx`: React UI in simple components.
- `client/src/api.js`: frontend API calls.

## Interview Explanation

The strongest technical story is the "Why This Job?" feature.

It uses the graph to explain recommendations through paths:

```text
Candidate -> HAS_SKILL -> Skill -> RELATED_TO -> Required Skill <- REQUIRES <- Job <- OFFERS - Company
```

This is where a graph database earns its place over a relational schema.
