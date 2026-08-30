# Expense Tracker Backend

A backend Expense Tracker application built using **Node.js, TypeScript, Express, MongoDB, Mongoose, Temporal.io, Docker, and Docker Compose**.

The primary goal of this project is to build a simple backend application while learning **Temporal workflow orchestration, Activities, retries, Child Workflows, and Docker-based infrastructure**.

The project is intentionally backend-only. No frontend is included because the main learning objective is backend development and Temporal.

---

## 1. Features

* Create, read, update, and delete expenses
* MongoDB persistence using Mongoose
* REST API using Express
* Temporal workflow for expense creation
* Temporal Activities
* Activity retry policy
* Temporal Worker
* Temporal Client
* Temporal Task Queue
* Notification Child Workflow
* Temporal Web UI
* Dockerized backend
* Dockerized Temporal Worker
* Docker Compose infrastructure
* Git/GitHub version control
* End-to-end testing using Postman and MongoDB Compass

---

## 2. Technology Stack

| Technology      | Purpose                                      |
| --------------- | -------------------------------------------- |
| Node.js         | JavaScript/TypeScript runtime                |
| TypeScript      | Backend development with static typing       |
| Express.js      | HTTP API and routing                         |
| MongoDB         | Application database                         |
| Mongoose        | MongoDB object modeling                      |
| Temporal.io     | Workflow orchestration                       |
| PostgreSQL      | Temporal persistence                         |
| Docker          | Containerization                             |
| Docker Compose  | Running the complete application environment |
| Postman         | API testing                                  |
| MongoDB Compass | Database inspection                          |
| Git/GitHub      | Version control                              |

---

## 3. Architecture

The application has two main execution paths.

### Normal REST API

```text
Postman
   |
   v
Express Backend
   |
   v
Controller
   |
   v
Mongoose
   |
   v
MongoDB
```

### Temporal Workflow

```text
Postman
   |
   | POST /expenses/workflow
   v
Express Backend
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
Temporal Worker
   |
   v
Expense Creation Workflow
   |
   +----> Expense Activity
   |          |
   |          v
   |       MongoDB
   |
   +----> Notification Child Workflow
```

The Temporal workflow is executed by the Worker through the `expense-tracker-task-queue`.

---

## 4. Project Structure

```text
expense-tracker/
│
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   └── expense.controller.ts
│   │
│   ├── models/
│   │   └── expense.model.ts
│   │
│   ├── routes/
│   │   └── expense.routes.ts
│   │
│   ├── temporal/
│   │   ├── activities.ts
│   │   ├── client.ts
│   │   ├── workflows.ts
│   │   ├── worker.ts
│   │   └── types.ts
│   │
│   └── index.ts
│
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
│
├── README.md
├── PROJECT_DOCUMENTATION.md
└── TROUBLESHOOTING.md
```

---

## 5. Prerequisites

Before running the project, make sure the following are installed:

* Node.js
* npm
* Git
* Docker Desktop
* Postman or another API testing tool

MongoDB and Temporal do **not** need to be installed separately because they are provided through Docker Compose.

---

## 6. Configuration

The application uses environment variables for configuration.

Typical configuration includes:

```text
PORT
MONGODB_URI
TEMPORAL_ADDRESS
```

When running services directly from the host machine, services can be accessed through `localhost`.

When services communicate inside Docker Compose, Docker service names are used instead.

For example:

```text
Host:
localhost:7233

Docker:
temporal:7233
```

and:

```text
Host:
mongodb://localhost:27017/expense-tracker

Docker:
mongodb://mongodb:27017/expense-tracker
```

---

## 7. Start the Project

Open PowerShell in the project root:

```powershell
cd path\to\expense-tracker
```

Start the complete environment:

```powershell
docker compose up -d
```

If the source code or Docker configuration has changed and the application needs to be rebuilt:

```powershell
docker compose up -d --build
```

Check the running services:

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

Docker Compose is used so that the entire application environment can be started together instead of manually starting each infrastructure component.

---

## 8. Important Services and Ports

| Service         | Address                     |
| --------------- | --------------------------- |
| Backend         | `http://localhost:4000`     |
| MongoDB         | `mongodb://localhost:27017` |
| Temporal Server | `localhost:7233`            |
| Temporal UI     | `http://localhost:8080`     |
| PostgreSQL      | `localhost:5432`            |

---

## 9. Verify the Backend

Open:

```text
http://localhost:4000
```

Expected response:

```json
{
  "success": true,
  "message": "Expense Tracker API is running."
}
```

---

## 10. Verify Temporal UI

Open:

```text
http://localhost:8080
```

The Temporal UI can be used to inspect workflow executions and their status.

---

## 11. Check Worker Logs

To view the latest Worker logs:

```powershell
docker compose logs --tail=50 worker
```

To continuously follow Worker logs:

```powershell
docker compose logs -f worker
```

Press:

```text
Ctrl + C
```

to stop following the logs. This only stops viewing the logs; it does not stop the Worker.

---

# 12. REST API

All API endpoints use the backend:

```text
http://localhost:4000
```

## Health Check

```http
GET /
```

---

## Create Expense

```http
POST /expenses
```

Example request:

```json
{
  "title": "Lunch",
  "amount": 250,
  "category": "Food",
  "date": "2026-08-20"
}
```

---

## Get All Expenses

```http
GET /expenses
```

---

## Get One Expense

```http
GET /expenses/:id
```

Example:

```http
GET /expenses/6a86e657afbc0bbdd66c711a
```

---

## Update Expense

```http
PUT /expenses/:id
```

Example request:

```json
{
  "title": "Dinner",
  "amount": 500,
  "category": "Food",
  "date": "2026-08-20"
}
```

---

## Delete Expense

```http
DELETE /expenses/:id
```

---

# 13. Create an Expense Through Temporal

The Temporal-based expense creation endpoint is:

```http
POST /expenses/workflow
```

Complete URL:

```text
http://localhost:4000/expenses/workflow
```

Example request:

```json
{
  "title": "Test Expense",
  "amount": 500,
  "category": "Food",
  "date": "2026-08-30"
}
```

The request starts a Temporal Workflow.

The flow is:

```text
HTTP Request
     |
     v
Express Backend
     |
     v
Temporal Client
     |
     v
Temporal Server
     |
     v
expense-tracker-task-queue
     |
     v
Temporal Worker
     |
     v
Expense Workflow
     |
     v
Activity
     |
     v
MongoDB
```

The project also contains a Notification Child Workflow as part of the Temporal implementation.

---

# 14. End-to-End Temporal Test

Start the project:

```powershell
docker compose up -d
```

Verify the services:

```powershell
docker compose ps
```

Then send:

```http
POST http://localhost:4000/expenses/workflow
```

with:

```json
{
  "title": "Test Expense",
  "amount": 500,
  "category": "Food",
  "date": "2026-08-30"
}
```

After sending the request, verify the result in three places.

### 1. Postman

The workflow request should succeed.

### 2. Temporal UI

Open:

```text
http://localhost:8080
```

The workflow execution should appear and complete.

### 3. MongoDB Compass

Connect to:

```text
mongodb://localhost:27017
```

Then verify:

```text
expense-tracker
└── expenses
```

The newly created expense should be present.

This provides an end-to-end verification of the API, Temporal workflow, Worker, Activity, and database persistence.

---

# 15. Building the TypeScript Project

To compile the TypeScript source:

```powershell
npm run build
```

The TypeScript source is compiled from:

```text
src/
```

into:

```text
dist/
```

---

# 16. Running Backend and Worker Without Docker

If MongoDB and Temporal are already running through Docker, the backend and Worker can also be started directly from Node.js.

Start the backend:

```powershell
npm start
```

In another terminal, start the Temporal Worker:

```powershell
npm run worker
```

The backend will be available at:

```text
http://localhost:4000
```

The Temporal UI remains available at:

```text
http://localhost:8080
```

For normal project usage, running the complete environment through Docker Compose is recommended.

---

# 17. Docker Commands

### Start

```powershell
docker compose up -d
```

### Start and rebuild

```powershell
docker compose up -d --build
```

### Check services

```powershell
docker compose ps
```

### View backend logs

```powershell
docker compose logs --tail=50 backend
```

### View Worker logs

```powershell
docker compose logs --tail=50 worker
```

### View all logs

```powershell
docker compose logs
```

### Stop the project

```powershell
docker compose down
```

---

# 18. Persistent Data

The project uses Docker named volumes for persistent data:

```text
mongodb_data
temporal_postgresql_data
```

These volumes allow the database data to survive normal container removal and recreation.

Therefore:

```text
docker compose down
```

normally removes the containers but keeps the named volumes.

However:

```powershell
docker compose down -v
```

also removes the Compose volumes.

**Do not use `docker compose down -v` unless you intentionally want to remove the persistent MongoDB and Temporal PostgreSQL data.**

---

# 19. Git

Check the current Git status:

```powershell
git status
```

Add changes:

```powershell
git add .
```

Commit:

```powershell
git commit -m "Update project"
```

Push to GitHub:

```powershell
git push
```

Make sure `.env` is excluded from Git.

A typical `.gitignore` should contain:

```text
node_modules/
dist/
.env
```

Do not commit secrets or local environment values.

---

# 20. Current Project Status

The current project scope is complete.

Implemented:

* TypeScript backend
* Express API
* MongoDB
* Mongoose
* CRUD operations
* Temporal Client
* Temporal Server
* Temporal Worker
* Temporal Workflows
* Temporal Activities
* Temporal Task Queue
* Activity retries
* Notification Child Workflow
* Temporal UI
* Docker
* Docker Compose
* Dockerized backend
* Dockerized Worker
* Git/GitHub
* End-to-end testing

The project has been tested through the REST API, Temporal UI, MongoDB, Dockerized backend, and Dockerized Worker.

No additional business functionality is required for the current learning scope.

---

# 21. Future Improvements

The project can later be extended with:

* Authentication
* User accounts
* Authorization
* Expense filtering
* Pagination
* Expense categories
* Reports
* Dashboard
* Frontend
* Unit tests
* Integration tests
* CI/CD
* Kubernetes
* Prometheus
* Grafana
* Cloud deployment

These are future improvements and are outside the current project scope.

---

# 22. Quick Start

For normal day-to-day usage:

### Start

```powershell
docker compose up -d
```

### Check

```powershell
docker compose ps
```

### Backend

```text
http://localhost:4000
```

### Temporal UI

```text
http://localhost:8080
```

### MongoDB Compass

```text
mongodb://localhost:27017
```

### Worker logs

```powershell
docker compose logs --tail=50 worker
```

### Test Temporal

```text
POST http://localhost:4000/expenses/workflow
```

### Stop

```powershell
docker compose down
```

### Rebuild

```powershell
docker compose up -d --build
```

---

## Project Completion Flow

```text
Code
  ↓
Docker
  ↓
Testing
  ↓
Documentation
  ↓
Git Commit
  ↓
GitHub
  ↓
DONE
```

The application code, Docker configuration, and infrastructure can be rebuilt from the project repository. Runtime database data is separate and depends on the Docker volumes.
