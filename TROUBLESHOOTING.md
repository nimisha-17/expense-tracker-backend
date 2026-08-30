# Troubleshooting Guide

## Expense Tracker Backend

This document records the main problems encountered while developing and running the Expense Tracker backend, along with their causes, investigation steps, and solutions.

The purpose of this file is to preserve the actual development troubleshooting history so that the same problems can be diagnosed quickly in the future.

---

# 1. `mongosh` Command Not Found

## Problem

When attempting to open the MongoDB shell using:

```powershell
mongosh
```

PowerShell returned:

```text
mongosh : The term 'mongosh' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

## Cause

The MongoDB Shell (`mongosh`) was not installed or was not available in the system `PATH`.

The important distinction is that having MongoDB-related tooling available through Docker does not automatically mean that `mongosh` is installed directly on Windows.

## Resolution

The project was moved toward using MongoDB through Docker rather than depending on a locally installed MongoDB shell.

MongoDB was started as a Docker service and could be accessed through:

```text
mongodb://localhost:27017
```

MongoDB Compass was also used to inspect the database and verify the stored expenses.

## Lesson

A database running inside Docker is independent of whether the corresponding command-line client is installed directly on the host operating system.

---

# 2. MongoDB Connection Refused

## Problem

The application initially produced a Mongoose connection error similar to:

```text
MongooseServerSelectionError:
connect ECONNREFUSED 127.0.0.1:27017
```

## Cause

The application attempted to connect to MongoDB on:

```text
127.0.0.1:27017
```

but MongoDB was not running at that address at the time.

The problem was therefore not necessarily the Mongoose code itself. The database server had to be running before the application could establish a connection.

## Resolution

MongoDB was added to Docker Compose.

The MongoDB service uses:

```text
mongo:8
```

and exposes:

```text
27017
```

After starting the Docker environment:

```powershell
docker compose up -d
```

the MongoDB container became available.

The running services could be checked with:

```powershell
docker compose ps
```

## Lesson

A MongoDB connection string only works when a MongoDB server is actually reachable at the specified address.

---

# 3. `ts-node-dev` Error

## Problem

While running the development server, an error occurred from `ts-node`/`ts-node-dev`:

```text
TypeError: Cannot read properties of undefined (reading 'fileExists')
```

The error occurred while `ts-node` was attempting to read the TypeScript configuration.

## Cause

The problem was related to the development toolchain and compatibility between the installed TypeScript/`ts-node` packages.

The issue was not caused by the Express application logic.

## Investigation

The installed versions were checked using npm commands such as:

```powershell
npm list typescript
```

The project had multiple TypeScript-related dependencies involved through `ts-node-dev` and `ts-node`.

## Resolution

The development setup was adjusted and the project was ultimately built and executed through the TypeScript compilation process.

The project uses:

```powershell
npm run build
```

to compile the TypeScript source into `dist`.

The compiled application can then be executed normally.

## Lesson

When a `ts-node` or `ts-node-dev` error occurs inside TypeScript's configuration/loading process, check the compatibility of:

```text
TypeScript
ts-node
ts-node-dev
```

before assuming that the application code itself is responsible.

---

# 4. TypeScript Error in Temporal Dependencies

## Problem

During the Temporal implementation, TypeScript compilation produced errors originating from Temporal dependency declaration files.

One of the errors involved:

```text
@temporalio/common
```

and a missing declaration related to:

```text
ms
```

Another Temporal-related TypeScript error involved:

```text
@temporalio/worker
```

with an error similar to:

```text
TS2344:
Type '[never]' does not satisfy the constraint 'EventMap<[never]>'
```

## Cause

The errors occurred within the installed Temporal package type definitions rather than directly within the project's business logic.

The project had Temporal package version compatibility issues during development.

## Investigation

The installed Temporal packages were inspected using:

```powershell
npm list
```

The Temporal package versions were checked to determine whether the packages were aligned.

The npm cache was also verified:

```powershell
npm cache verify
```

## Resolution

The Temporal dependencies and project TypeScript configuration were adjusted until the project could successfully build.

The final Docker environment used:

```text
temporalio/auto-setup:1.29.1
temporalio/ui:2.34.0
```

The project was subsequently able to compile and the Temporal Worker was successfully started.

## Lesson

Temporal consists of multiple packages that work together. When Temporal type errors appear inside `node_modules`, package versions and compatibility should be checked before changing application code.

---

# 5. `Cannot POST /start-workflow`

## Problem

An attempt was made to start a Temporal Workflow through:

```http
POST /start-workflow
```

The server responded with:

```text
Cannot POST /start-workflow
```

## Cause

There was no Express route registered for:

```text
/start-workflow
```

The backend's actual workflow endpoint was later implemented under the expenses route.

## Resolution

The workflow endpoint was changed to:

```http
POST /expenses/workflow
```

The complete URL became:

```text
http://localhost:4000/expenses/workflow
```

A request body such as:

```json
{
  "title": "Test Expense",
  "amount": 500,
  "category": "Food",
  "date": "2026-08-30"
}
```

can be used to start the workflow.

## Lesson

A `Cannot POST <route>` error generally means that Express does not have a matching POST route registered for the requested path.

The client URL must exactly match the route implemented by the backend.

---

# 6. Temporal Worker Not Running

## Problem

The Temporal Workflow could be started from the backend, but a Worker was required to actually execute the Workflow and Activities.

## Cause

Temporal follows a separation between Workflow execution requests and Worker execution.

Starting the Temporal Server alone does not execute application Workflows.

A Worker must connect to Temporal and poll the correct Task Queue.

## Resolution

The project added a Temporal Worker:

```text
src/temporal/worker.ts
```

The Worker listens on:

```text
expense-tracker-task-queue
```

The Worker was started during development using:

```powershell
npm run worker
```

Later, the Worker was included as a Docker Compose service.

Worker logs can be checked with:

```powershell
docker compose logs --tail=50 worker
```

## Lesson

The basic Temporal execution chain is:

```text
Client
  ↓
Temporal Server
  ↓
Task Queue
  ↓
Worker
  ↓
Workflow
  ↓
Activity
```

A Workflow request does not mean that the Worker is executing it automatically.

---

# 7. Docker Compose Path / URI Error

## Problem

An error occurred while working with Docker Compose:

```text
Unable to get absolute uri between \docker-compose.yml and ;
Base path '' must be an absolute path.
```

## Cause

Docker Compose encountered an invalid path/reference in the Compose configuration.

This was related to how the Compose configuration was being interpreted rather than an application runtime error.

## Investigation

The Compose configuration was inspected using:

```powershell
docker compose config
```

This command is useful because it validates and renders the effective Compose configuration.

## Resolution

The Docker Compose configuration was corrected and validated.

After correction, the services could be started successfully with:

```powershell
docker compose up -d
```

## Lesson

When Docker Compose reports a confusing path or configuration error, use:

```powershell
docker compose config
```

before attempting to debug the containers themselves.

It helps identify problems in the Compose configuration before the services are started.

---

# 8. `npm ci` Failure During Docker Build

## Problem

While running:

```powershell
docker compose up -d
```

Docker failed during the image build at:

```text
RUN npm ci
```

The output included:

```text
npm error Exit handler never called!
npm error This is an error with npm itself.
```

## Cause

The failure occurred during npm dependency installation inside the Docker build.

The error indicated a problem with npm's execution rather than an application runtime error.

Because `npm ci` runs before the application is built, the Docker image could not continue to the later build steps.

## Investigation

The npm cache was verified and the dependency installation environment was examined.

The distinction between:

```text
npm ci
```

and the application itself was important.

The error occurred during:

```text
Docker build
    ↓
npm ci
```

rather than when the application was running.

## Resolution

The dependency/build environment was corrected and the Docker build was rerun.

Once `npm ci` completed successfully, Docker could continue building the image.

## Lesson

A Docker build error at:

```text
RUN npm ci
```

is a dependency installation/build problem.

It should be debugged separately from:

* Express runtime errors
* MongoDB connection errors
* Temporal Worker errors
* API errors

---

# 9. Docker Container vs Docker Image Confusion

## Problem

During Docker development, there was concern about what would happen if containers or images were removed.

## Explanation

The project source code is not stored inside the container as the only copy.

The source repository contains files such as:

```text
Dockerfile
docker-compose.yml
package.json
package-lock.json
src/
tsconfig.json
```

Docker uses these files to create the application image and containers.

Therefore, if containers are removed, they can be recreated:

```powershell
docker compose up -d
```

If an application image needs to be rebuilt:

```powershell
docker compose up -d --build
```

## Important Difference

```text
Source Code
    |
    v
Dockerfile
    |
    v
Image
    |
    v
Container
```

Deleting the container does not delete the source repository.

Deleting an image does not delete the source repository either.

## Lesson

Containers and images are generated runtime/build artifacts. The project's source code and Docker configuration remain the foundation from which they can be recreated.

---

# 10. Docker Volumes and Data Loss

## Problem

There was a need to understand whether removing Docker containers would delete the MongoDB data.

## Cause of Confusion

Containers and volumes have different lifecycles.

The project uses named Docker volumes for persistent data:

```text
mongodb_data
temporal_postgresql_data
```

Running:

```powershell
docker compose down
```

normally removes the containers but keeps named volumes.

Therefore, the MongoDB data normally remains available when the project is started again:

```powershell
docker compose up -d
```

## Dangerous Command

The following command removes the Compose volumes:

```powershell
docker compose down -v
```

This can remove the stored MongoDB and Temporal PostgreSQL data.

## Lesson

Remember the difference:

```text
docker compose down
```

→ Stop/remove containers.

```text
docker compose down -v
```

→ Stop/remove containers and remove associated volumes.

---

# 11. `localhost` Inside Docker

## Problem

A common source of confusion was deciding whether to use:

```text
localhost
```

or a Docker service name when connecting between services.

## Cause

`localhost` has different meanings depending on where the application is running.

If the application is running directly on Windows:

```text
localhost
```

refers to the Windows host.

If the application is running inside a Docker container:

```text
localhost
```

refers to that specific container.

It does not refer to another container.

## Resolution

Docker Compose service names are used for container-to-container communication.

For example:

```text
Backend container
      |
      v
temporal:7233
```

and:

```text
Backend container
      |
      v
mongodb:27017
```

From the host machine, exposed ports can instead be accessed using:

```text
localhost:7233
localhost:27017
```

## Lesson

Use:

```text
localhost:<port>
```

when connecting from the host.

Use:

```text
<docker-service-name>:<port>
```

when one Docker container connects to another Docker container.

---

# 12. Backend and Worker Startup Confusion

## Problem

During development, it was necessary to understand which processes had to be started manually.

Initially, the project involved manually starting different components such as:

* MongoDB
* Temporal
* Backend
* Worker

## Resolution

Docker Compose was eventually configured to manage the complete environment.

The project now contains services for:

```text
mongodb
temporal-postgresql
temporal
temporal-ui
backend
worker
```

The normal startup command is:

```powershell
docker compose up -d
```

This significantly simplifies the startup process.

## Lesson

Docker Compose acts as the orchestration layer for the local development environment.

Instead of starting every infrastructure service individually, the project can be started as one environment.

---

# 13. Verifying Docker Services

## Problem

After starting Docker Compose, it was necessary to determine whether all required services were actually running.

## Resolution

The following command was used:

```powershell
docker compose ps
```

The expected services are:

```text
mongodb
temporal-postgresql
temporal
temporal-ui
backend
worker
```

For more detailed diagnosis, logs can be inspected.

For example:

```powershell
docker compose logs --tail=50 worker
```

or:

```powershell
docker compose logs --tail=50 backend
```

## Lesson

`docker compose ps` confirms container status, while `docker compose logs` helps determine why a service may not be working correctly.

---

# 14. Temporal UI Verification

## Problem

It was necessary to verify whether the Workflow was actually being executed rather than relying only on the API response.

## Resolution

Temporal UI was used:

```text
http://localhost:8080
```

The Workflow execution could be inspected there.

The UI helped verify:

* Workflow creation
* Workflow execution
* Task Queue association
* Workflow completion

This was especially useful when debugging the Worker and Workflow execution path.

## Lesson

The Temporal UI provides an important visibility layer when developing and debugging Temporal applications.

---

# 15. End-to-End Verification

After the individual components were working, the entire system was tested together.

The test sequence was:

```text
Postman
   |
   v
POST /expenses/workflow
   |
   v
Express
   |
   v
Temporal Client
   |
   v
Temporal Server
   |
   v
Task Queue
   |
   v
Worker
   |
   v
Workflow
   |
   v
Activity
   |
   v
MongoDB
```

The result was verified through:

### Postman

The API request succeeded.

### Temporal UI

The Workflow appeared and completed.

### MongoDB Compass

The created expense appeared in:

```text
expense-tracker
└── expenses
```

This confirmed that the complete application path was functioning.

---

# 16. Git Status and `.env`

## Problem

After making Docker and configuration changes, it was necessary to ensure that the repository did not contain unintended files or secrets.

## Resolution

Git status was checked using:

```powershell
git status
```

The expected clean state is:

```text
nothing to commit, working tree clean
```

Ignored files can be inspected using:

```powershell
git status --ignored
```

The `.env` file should be ignored.

A typical `.gitignore` includes:

```text
node_modules/
dist/
.env
```

## Lesson

Environment configuration should remain local and should not be committed to GitHub when it contains local values or secrets.

---

# 17. General Troubleshooting Approach

The project demonstrated that different types of failures should be diagnosed at different layers.

## Application Layer

Examples:

```text
Cannot POST /...
```

Check:

* Express routes
* HTTP method
* Endpoint path
* Controller

---

## Database Layer

Examples:

```text
ECONNREFUSED 127.0.0.1:27017
```

Check:

* MongoDB status
* Connection string
* Port
* Docker container
* Docker service name

---

## Temporal Layer

Check:

* Temporal Server
* Temporal Client
* Task Queue
* Worker
* Workflow
* Activity
* Temporal UI

---

## Docker Layer

Check:

```powershell
docker compose ps
```

then:

```powershell
docker compose logs
```

For configuration problems:

```powershell
docker compose config
```

For rebuild problems:

```powershell
docker compose up -d --build
```

---

## Dependency Layer

For npm-related failures, inspect:

* `package.json`
* `package-lock.json`
* Node.js version
* npm version
* TypeScript version
* Temporal package versions

A failure during:

```text
npm ci
```

should be treated as a dependency/build problem rather than an application runtime problem.

---

# 18. Final Troubleshooting Checklist

When the project does not start, check the following in order.

### Step 1 — Docker

```powershell
docker --version
```

### Step 2 — Docker Compose

```powershell
docker compose ps
```

### Step 3 — Validate Compose

```powershell
docker compose config
```

### Step 4 — Check Logs

```powershell
docker compose logs --tail=50 backend
```

```powershell
docker compose logs --tail=50 worker
```

### Step 5 — Check Backend

Open:

```text
http://localhost:4000
```

### Step 6 — Check Temporal UI

Open:

```text
http://localhost:8080
```

### Step 7 — Check MongoDB

Verify the MongoDB container is running:

```powershell
docker compose ps
```

Then inspect the database using MongoDB Compass.

### Step 8 — Test the Workflow

```text
POST http://localhost:4000/expenses/workflow
```

### Step 9 — Verify Workflow

Check Temporal UI.

### Step 10 — Verify Database

Check:

```text
expense-tracker
└── expenses
```

---

# 19. Key Lessons From the Troubleshooting Process

The main lessons learned during development were:

1. **A running application depends on multiple independent services.**
   Backend, MongoDB, Temporal Server, and Worker can fail independently.

2. **Docker build errors and runtime errors are different.**
   An error during `npm ci` happens during image creation, while an API error occurs after the container is running.

3. **`localhost` depends on where the application is running.**
   Host applications use `localhost`; Docker containers generally use Docker service names for other containers.

4. **Temporal Server and Temporal Worker have different responsibilities.**
   Starting Temporal does not mean the application's Workflow is automatically being executed.

5. **Task Queue configuration must match between the Workflow and Worker.**

6. **Docker containers are not the same as persistent data.**
   Named volumes are responsible for retaining database data.

7. **Temporal UI is extremely useful for debugging Workflow execution.**

8. **`docker compose config` is useful for diagnosing Compose configuration errors before troubleshooting individual containers.**

9. **GitHub stores the project source, not runtime database state.**

10. **Keeping `.env` out of Git is important for protecting environment-specific configuration and secrets.**

---

# 20. Final Troubleshooting Summary

The project encountered issues across several layers:

```text
Development Tools
      |
      +---- ts-node / TypeScript issues
      |
      v
Dependencies
      |
      +---- npm / Temporal package issues
      |
      v
Database
      |
      +---- MongoDB connection issues
      |
      v
API
      |
      +---- Incorrect workflow endpoint
      |
      v
Temporal
      |
      +---- Worker / Task Queue understanding
      |
      v
Docker
      |
      +---- Compose configuration
      +---- npm ci build failure
      +---- container networking
      +---- volumes
```

Resolving these issues resulted in a working environment containing the backend, MongoDB, Temporal Server, Temporal UI, PostgreSQL, and Temporal Worker.

The final application can be started through Docker Compose and verified end-to-end using Postman, Temporal UI, and MongoDB Compass.
