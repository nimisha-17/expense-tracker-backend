# Expense Tracker Backend

# Complete Project Documentation

## 1. Project Overview

The Expense Tracker is a backend application built using **TypeScript, Express, MongoDB, Mongoose, and Temporal.io**.

The project started as a simple Expense Tracker backend and was intentionally kept without a frontend. The primary learning objectives were:

* TypeScript backend development
* REST API development
* MongoDB and Mongoose
* Temporal workflow orchestration
* Temporal Activities
* Activity retries
* Child Workflows
* Docker
* Docker Compose
* Distributed application architecture

The project gradually evolved from a traditional CRUD backend into a small distributed backend system in which Temporal is responsible for orchestrating long-running and reliable operations.

---

# 2. Project Objectives

The project was designed with two goals.

### Functional Goal

Build a working Expense Tracker backend capable of:

* Creating expenses
* Reading expenses
* Updating expenses
* Deleting expenses
* Persisting expense data in MongoDB
* Creating expenses through a Temporal Workflow

### Learning Goal

Use the project to understand:

* TypeScript
* Express
* MongoDB
* Mongoose
* Temporal
* Workflows
* Activities
* Workers
* Task Queues
* Retries
* Child Workflows
* Docker
* Docker Compose
* Container networking

The project was deliberately kept simple so that the focus remained on understanding Temporal rather than building a large business application.

---

# 3. Why TypeScript Was Used

TypeScript was used instead of plain JavaScript to provide static typing and a more structured development experience.

The main benefits relevant to this project are:

* Static type checking
* Interfaces and explicit data types
* Earlier detection of programming errors
* Better code organization
* Better understanding of data passed between components
* Stronger understanding of types while working with Temporal

TypeScript source code is compiled using the TypeScript compiler.

The source code is maintained in:

```text
src/
```

and the compiled JavaScript is generated in:

```text
dist/
```

The build process is performed with:

```powershell
npm run build
```

which runs the TypeScript compiler.

---

# 4. Why Express Was Used

Express provides the HTTP API layer of the application.

Its responsibility is to:

1. Receive HTTP requests.
2. Match requests to routes.
3. Pass requests to the appropriate controller.
4. Perform normal CRUD operations or start a Temporal Workflow.
5. Return HTTP responses to the client.

The general API architecture is:

```text
Client
   |
   v
Express
   |
   +----> CRUD Controller ----> MongoDB
   |
   +----> Temporal Client ----> Temporal
```

This keeps the HTTP API separate from workflow orchestration.

---

# 5. Why MongoDB Was Used

MongoDB is the application's persistent database.

Expenses are stored in the MongoDB `expenses` collection.

The database is accessed from Node.js through **Mongoose**.

The basic responsibility separation is:

```text
Express
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

MongoDB was also selected because it provides a simple document-oriented model suitable for an Expense Tracker.

---

# 6. Why Mongoose Was Used

Mongoose acts as the object modeling layer between the TypeScript/Node.js application and MongoDB.

The Expense model defines the structure of an expense.

The implemented expense data includes:

```text
title
amount
category
date
```

Mongoose also provides functionality such as:

* Schema definition
* Model creation
* Database queries
* Document creation
* Document updates
* Document deletion
* MongoDB interaction from application code

This keeps database-related logic organized instead of placing raw database operations throughout the HTTP layer.

---

# 7. CRUD Implementation

The initial backend functionality was implemented as standard REST CRUD operations.

The five operations are:

```text
CREATE
READ ALL
READ ONE
UPDATE
DELETE
```

The corresponding API endpoints are:

```text
POST   /expenses
GET    /expenses
GET    /expenses/:id
PUT    /expenses/:id
DELETE /expenses/:id
```

These operations were tested through Postman.

MongoDB Compass was also used to verify that the data was actually stored and modified in the database.

This established the basic application before Temporal was introduced.

---

# 8. Why Temporal Was Introduced

Temporal was introduced primarily as a learning objective.

A traditional backend might directly perform an operation after receiving an HTTP request:

```text
HTTP Request
     |
     v
Express
     |
     v
Database
```

With Temporal, the application can instead start a Workflow:

```text
HTTP Request
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
Worker
     |
     v
Workflow
     |
     v
Activity
     |
     v
Database
```

This introduces a separation between:

* Request handling
* Workflow orchestration
* External side effects

Temporal provides capabilities such as:

* Durable execution
* Workflow state
* Task Queues
* Retry handling
* Failure recovery
* Long-running workflows
* Child Workflows

The project therefore uses Temporal to demonstrate reliable workflow orchestration rather than simply using it as another database or API framework.

---

# 9. Temporal Architecture

The main Temporal components used in this project are:

```text
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
      +----> Workflow
      |
      +----> Activity
      |
      +----> Child Workflow
```

Each component has a different responsibility.

---

# 10. Temporal Server

The Temporal Server is responsible for orchestrating workflow execution.

It manages workflow state, scheduling, and task delivery.

The project runs Temporal through Docker.

When accessed from the host machine, Temporal is exposed through:

```text
localhost:7233
```

When another container communicates with Temporal inside Docker Compose, it uses the Docker service name:

```text
temporal:7233
```

This distinction is important because `localhost` inside a container refers to that container itself, not another container.

---

# 11. Temporal UI

Temporal UI provides a web interface for inspecting Workflow executions.

It runs at:

```text
http://localhost:8080
```

The UI was used to verify that workflows were:

* Created
* Running
* Completed
* Associated with the expected Task Queue

This provided visibility into Temporal execution during development and testing.

---

# 12. Temporal Client

The Temporal Client allows the application to communicate with the Temporal Server.

The project contains:

```text
src/temporal/client.ts
```

The Express backend uses the Temporal Client when the workflow-based expense endpoint is called.

The communication flow is:

```text
HTTP Request
      |
      v
Express
      |
      v
Temporal Client
      |
      v
Temporal Server
```

The Client starts a Workflow execution rather than executing the Workflow itself.

---

# 13. Temporal Worker

The Temporal Worker is responsible for executing Workflows and Activities.

The Worker is located at:

```text
src/temporal/worker.ts
```

It connects to the Temporal Server and polls the configured Task Queue.

The project uses:

```text
expense-tracker-task-queue
```

The Worker was successfully tested and reached a running state.

The Worker is separate from the Express backend because the two components have different responsibilities:

```text
Backend
   |
   +---- Receives HTTP requests
   |
   +---- Starts Workflows

Worker
   |
   +---- Polls Temporal
   |
   +---- Executes Workflows
   |
   +---- Executes Activities
   |
   +---- Executes Child Workflows
```

This separation also means the Worker can be scaled independently from the HTTP API.

---

# 14. Task Queue

The project uses the following Temporal Task Queue:

```text
expense-tracker-task-queue
```

A Task Queue connects Workflow execution requests with Workers capable of executing them.

The flow is:

```text
Backend
   |
   v
Temporal Server
   |
   v
expense-tracker-task-queue
   |
   v
Worker
```

The Worker continuously polls the Task Queue for work.

---

# 15. Temporal Workflow

A Temporal Workflow contains the orchestration logic.

For this project, the main Workflow coordinates the expense creation process.

The Workflow does not directly perform arbitrary external side effects such as database operations.

Instead, it calls an Activity:

```text
Workflow
    |
    v
Activity
    |
    v
Database
```

This separation is important because Temporal Workflows must follow deterministic execution rules. External side effects therefore belong in Activities.

---

# 16. Temporal Activity

Activities perform operations that interact with external systems.

In this project, the expense-related database operation is performed by an Activity.

Activities are appropriate for operations such as:

* Database operations
* HTTP calls
* File operations
* Notifications
* Other external side effects

The Worker executes the Activities.

The architecture therefore separates orchestration from side effects:

```text
Workflow
   |
   v
Activity
   |
   v
External System
```

For this project:

```text
Activity
   |
   v
MongoDB
```

---

# 17. Expense Creation Workflow

The complete workflow-based expense creation path is:

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
Expense Workflow
   |
   v
Expense Activity
   |
   v
MongoDB
```

The Workflow execution can be inspected through Temporal UI.

The resulting database record can independently be verified through MongoDB Compass.

This provides two separate verification points:

```text
Temporal UI
     +
MongoDB
```

---

# 18. Temporal Retries

One of the major reasons Temporal was included was to learn Activity retry behavior.

An Activity can be configured with a retry policy.

Conceptually:

```text
Workflow
   |
   v
Activity
   |
   v
Failure
   |
   v
Retry
   |
   v
Activity
   |
   v
Success
```

This is useful for transient failures.

Instead of manually writing retry loops inside application code, Temporal can manage Activity retry behavior according to the configured retry policy.

The project implements retries to demonstrate this Temporal capability.

---

# 19. Child Workflow

A Child Workflow was implemented to demonstrate how one Temporal Workflow can start another Workflow.

The project includes a Notification Child Workflow.

Conceptually:

```text
Parent Workflow
      |
      v
Notification Child Workflow
      |
      v
Notification Processing
```

The purpose of this implementation is primarily educational: it demonstrates how Workflow execution can be divided into parent and child Workflows.

The Child Workflow is part of the project's Temporal learning scope.

---

# 20. Why Docker Was Introduced

Docker was introduced to make the application's infrastructure easier to start and reproduce.

Without Docker Compose, the developer would have to manage several services independently:

```text
MongoDB
PostgreSQL
Temporal
Temporal UI
Backend
Worker
```

With Docker Compose, the complete environment can be started with:

```powershell
docker compose up -d
```

This makes the development environment more consistent and reduces the number of manual startup steps.

---

# 21. Docker Compose Architecture

Docker Compose manages the services required by the application.

The environment contains:

```text
MongoDB
     |
     +---- Application database

PostgreSQL
     |
     +---- Temporal persistence

Temporal Server
     |
     +---- Workflow orchestration

Temporal UI
     |
     +---- Workflow monitoring

Backend
     |
     +---- HTTP API

Worker
     |
     +---- Workflow/Activity execution
```

The six application services are:

```text
mongodb
temporal-postgresql
temporal
temporal-ui
backend
worker
```

---

# 22. Docker Networking

One of the important concepts learned during the project was the difference between **host networking** and **container networking**.

When an application runs directly on the host:

```text
localhost
```

is used to access services exposed by Docker.

For example:

```text
localhost:7233
localhost:27017
```

Inside Docker Compose, services communicate through their service names.

For example:

```text
temporal:7233
mongodb:27017
```

Therefore:

```text
Windows Host
     |
     +---- localhost

Docker Container
     |
     +---- service-name
```

This distinction was important when configuring:

```text
MONGODB_URI
TEMPORAL_ADDRESS
```

---

# 23. Backend and Worker Separation

The backend and Worker were intentionally kept as separate services.

### Backend responsibility

The backend:

* Receives HTTP requests
* Handles REST endpoints
* Performs normal CRUD operations
* Uses the Temporal Client
* Starts Temporal Workflows

For example:

```text
POST /expenses/workflow
```

starts the Temporal-based expense creation flow.

### Worker responsibility

The Worker:

* Connects to Temporal
* Polls the Task Queue
* Executes Workflows
* Executes Activities
* Executes Child Workflows

The Worker does not act as the normal HTTP API.

This separation follows the architecture of Temporal and allows the Worker and API layer to be scaled independently.

---

# 24. Persistence and Docker Volumes

Docker Compose uses persistent volumes:

```yaml
volumes:
  mongodb_data:
  temporal_postgresql_data:
```

The MongoDB volume stores application database data.

Conceptually:

```text
mongodb_data
     |
     v
MongoDB
     |
     v
expenses
```

Removing a container does not normally remove its named volume.

Similarly, deleting a Docker image does not normally delete the database volume.

However:

```powershell
docker compose down -v
```

removes the Compose volumes.

Therefore, `docker compose down -v` can remove the stored MongoDB and Temporal PostgreSQL data.

---

# 25. Build and Runtime Separation

The project also demonstrated the difference between a Docker **build-time problem** and a **runtime problem**.

The general Docker process is:

```text
Dockerfile
    |
    v
Dependency Installation
    |
    v
npm run build
    |
    v
Docker Image
    |
    v
Container
```

If dependency installation fails, the build cannot continue.

If the image cannot be built, the corresponding container cannot start.

This distinction was particularly important when debugging the backend and Worker Docker images.

---

# 26. Environment Configuration

Environment-specific configuration was separated from source code using environment variables.

The project uses values such as:

```text
PORT
MONGODB_URI
TEMPORAL_ADDRESS
```

This makes it possible to use different addresses depending on whether the application is running:

* Directly on the host
* Inside Docker Compose

The `.env` file is local configuration and should not be committed to GitHub.

The `.gitignore` contains:

```text
node_modules/
dist/
.env
```

This prevents local environment configuration and generated files from being committed.

---

# 27. Testing Strategy

The project was tested at multiple levels.

## REST API Testing

Postman was used to test:

* Create
* Read all
* Read one
* Update
* Delete

## Temporal Testing

The workflow endpoint was tested using:

```text
POST /expenses/workflow
```

## Temporal UI Verification

Temporal UI was used to confirm that the Workflow:

* Was created
* Was picked up
* Executed
* Completed

## Database Verification

MongoDB Compass was used to confirm that the Activity actually created the expense in MongoDB.

The complete verification therefore follows:

```text
Postman
   |
   v
Temporal UI
   |
   v
MongoDB Compass
```

This provided end-to-end confirmation rather than relying on only the HTTP response.

---

# 28. Git and GitHub

Git was used for version control throughout the project.

The project source code, configuration files, Docker configuration, and documentation can be stored in GitHub.

The important distinction is that Git stores the project itself, while runtime database information is stored in Docker volumes.

Therefore:

```text
GitHub
   |
   +---- Source code
   +---- Dockerfile
   +---- docker-compose.yml
   +---- Configuration templates
   +---- Documentation
```

while:

```text
Docker Volume
   |
   +---- MongoDB runtime data
   +---- Temporal PostgreSQL runtime data
```

If Docker containers or images are deleted, the application can be rebuilt from the project files.

If the MongoDB volume is permanently deleted, the previously stored database records cannot be recreated from GitHub.

---

# 29. Overall Request and Execution Flow

The most important architectural flow in the project is:

```text
                    ┌─────────────────┐
                    │     Postman     │
                    └────────┬────────┘
                             |
                             v
                    ┌─────────────────┐
                    │ Express Backend │
                    └────────┬────────┘
                             |
                             v
                    ┌─────────────────┐
                    │ Temporal Client │
                    └────────┬────────┘
                             |
                             v
                    ┌─────────────────┐
                    │ Temporal Server │
                    └────────┬────────┘
                             |
                             v
                 ┌───────────────────────┐
                 │   Task Queue          │
                 │ expense-tracker-      │
                 │ task-queue            │
                 └───────────┬───────────┘
                             |
                             v
                    ┌─────────────────┐
                    │ Temporal Worker │
                    └────────┬────────┘
                             |
                             v
                    ┌─────────────────┐
                    │    Workflow     │
                    └────────┬────────┘
                             |
                  ┌──────────┴──────────┐
                  |                     |
                  v                     v
          ┌───────────────┐    ┌─────────────────┐
          │   Activity    │    │ Child Workflow  │
          └───────┬───────┘    └─────────────────┘
                  |
                  v
          ┌───────────────┐
          │    MongoDB    │
          └───────────────┘
```

This architecture demonstrates the separation of responsibilities between the API layer, workflow orchestration layer, Worker, external side effects, and persistence layer.

---

# 30. Major Concepts Learned

The project provided practical experience with the following concepts.

### Backend Development

* REST APIs
* Express routing
* Controllers
* MongoDB
* Mongoose
* CRUD

### TypeScript

* Typed backend development
* Compilation
* `tsconfig.json`
* `src` to `dist` workflow

### Temporal

* Temporal Client
* Temporal Server
* Worker
* Workflow
* Activity
* Task Queue
* Retry Policy
* Child Workflow
* Workflow execution monitoring

### Docker

* Images
* Containers
* Dockerfile
* Docker Compose
* Services
* Volumes
* Container networking
* Build vs runtime

### Development and Operations

* Postman testing
* MongoDB Compass
* Docker logs
* Git
* GitHub
* Environment variables

---

# 31. Current Project Status

The project currently contains all functionality required for its intended learning scope.

Implemented:

* Backend
* TypeScript
* Express
* MongoDB
* Mongoose
* CRUD
* Temporal Server
* Temporal UI
* Temporal Client
* Temporal Worker
* Workflows
* Activities
* Retries
* Child Workflow
* Notification Workflow
* Docker
* Docker Compose
* Dockerized backend
* Dockerized Worker
* Git
* GitHub
* Documentation
* End-to-end testing

No additional business functionality is required for the current scope.

---

# 32. Possible Future Improvements

The current project can be extended in the future with:

* Authentication
* Users
* Authorization
* Expense filtering
* Pagination
* More advanced categories
* Reports
* Dashboard
* Frontend
* Unit testing
* Integration testing
* CI/CD
* Kubernetes
* Prometheus
* Grafana
* Cloud deployment

These features are intentionally outside the current implementation scope.

---

# 33. Final Architecture Summary

The project evolved from a simple CRUD backend into a distributed backend system using Temporal.

The final responsibility separation is:

```text
Express
   |
   +---- API Layer
   |
   v
Temporal Client
   |
   +---- Workflow Starter
   |
   v
Temporal Server
   |
   +---- Workflow Orchestration
   |
   v
Temporal Worker
   |
   +---- Workflow Execution
   |
   v
Activity
   |
   +---- External Side Effects
   |
   v
MongoDB
   |
   +---- Persistence
```

Docker Compose provides the infrastructure required to run the complete system.

The most important architectural lesson from the project is that each component has a specific responsibility:

* **Express** handles HTTP requests.
* **Temporal Client** starts Workflows.
* **Temporal Server** manages Workflow execution.
* **Task Queue** connects Workflows with Workers.
* **Worker** executes Workflows and Activities.
* **Workflow** contains orchestration logic.
* **Activity** performs external side effects.
* **Child Workflow** delegates additional Workflow execution.
* **MongoDB** stores application data.
* **Docker Compose** provides the complete runtime environment.

The project therefore provides a practical introduction to backend development, workflow orchestration, reliable execution, retries, distributed execution, and containerization.
