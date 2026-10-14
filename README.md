# ProjektIQ Frontend

**ProjektIQ** is a React-based project lifecycle management application that helps teams organise projects, manage requirements and tasks, track issues and change requests, coordinate team members, record work hours, and communicate through integrated chat.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture and Patterns](#architecture-and-patterns)
- [Data Models](#data-models)
- [Services and API Layer](#services-and-api-layer)
- [Navigation and Routing](#navigation-and-routing)
- [Administration and Membership](#administration-and-membership)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Backend Requirements](#backend-requirements)
- [Testing](#testing)
- [Build and Deployment](#build-and-deployment)
- [Security Considerations](#security-considerations)
- [Developer Notes](#developer-notes)

## Overview

ProjektIQ provides a central workspace for managing the project lifecycle, from project creation and requirement management to task execution, issue tracking, change requests, scheduling, and maintenance-related activities.

The frontend is built with React and communicates with a separate backend through HTTP APIs. It also supports WebSocket-based communication for chat functionality.

The application includes organization and project membership management, role-aware navigation, project activity logs, time tracking, and team communication features.

**Repository:** [munacips/projektiq-frontend-latest](https://github.com/munacips/projektiq-frontend-latest)

## Features

### 1. Authentication and Account Management

- User registration and login.
- OAuth-based access-token acquisition.
- Access-token and refresh-token storage.
- Token refresh handling in selected API request flows.
- Logout and session cleanup.
- Account information and user search.

### 2. Organization Management

- Create and view organizations.
- Manage organization membership.
- Add members to organizations.
- Assign and manage member roles.
- View organization-related information.
- Apply role-based restrictions to selected management screens.

### 3. Project Management

- View projects associated with the current user.
- Create projects with descriptive information and dates.
- View individual project details.
- Manage project-related information.
- Associate organizations and members with projects.
- Review project activity logs.
- Restrict selected project management operations to authorized roles.

### 4. Requirements and Task Management

- Create and view project requirements.
- Browse tasks and inspect individual task details.
- Create tasks and associate work with relevant project members.
- Support task-related project workflows.
- Provide screens for organising and tracking project work.

### 5. Issue and Change Request Management

- Browse reported issues.
- View individual issue details.
- Create issues.
- View and create change requests.
- Support project maintenance and change-management workflows.

### 6. Scheduling and Time Tracking

- View scheduling and calendar interfaces.
- Work with date-based project information.
- View and manage time-log records.
- Use timeline and Gantt-related UI dependencies for scheduling-oriented functionality.

### 7. Team Communication

- Access the chat interface.
- Support direct and group conversations.
- Search for users when initiating conversations.
- Retrieve conversation information through HTTP APIs.
- Exchange live chat updates through WebSockets.
- Track message read state where supported by the API.

### 8. Search and Navigation

- Search for users and other backend-provided results.
- Navigate between projects, organizations, tasks, issues, requirements, and communication screens.
- Access shared navigation components.
- Apply route-level access checks to selected management pages.

> Feature availability depends on the backend implementation, the data returned by the API, and the permissions assigned to the current user.

## Tech Stack

The following versions are based on the declared dependency ranges in `package.json`. They are not necessarily the exact versions installed on every developer's machine. Refer to `package-lock.json` for resolved versions.

| Concern | Package / Tool | Version |
|---|---|---|
| Frontend framework | React | `^18.3.1` |
| DOM rendering | React DOM | `^18.3.1` |
| Application tooling | Create React App / `react-scripts` | `^5.0.1` |
| Client-side routing | React Router DOM | `^6.28.0` |
| HTTP communication | Axios | `^1.7.7` |
| UI component library | Material UI | `@mui/material ^5.16.14` |
| UI icons | Material UI Icons | `@mui/icons-material ^5.16.14` |
| Date and time pickers | MUI X Date Pickers | `^5.0.20` |
| Calendar interface | React Big Calendar | `^1.16.3` |
| Scheduling interface | DevExpress React Scheduler packages | `^4.0.9` |
| Gantt chart | Frappe Gantt | `^1.0.3` |
| React Gantt integration | React Frappe Gantt | `^0.2.3` |
| Gantt task interface | Gantt Task React | `^0.3.9` |
| Data visualisation | Recharts | `^2.15.0` |
| Icon library | React Icons | `^5.3.0` |
| Additional icons | Font Awesome Free | `^6.7.2` |
| Date utilities | Moment.js | `^2.30.1` |
| Cookie management | js-cookie | `^3.0.5` |
| Component testing | React Testing Library | `^13.4.0` |
| DOM testing matchers | Jest DOM | `^5.17.0` |
| User interaction testing | Testing Library User Event | `^13.5.0` |
| Performance metrics | web-vitals | `^2.1.4` |
| CSS framework | Tailwind CSS | `^4.1.6` |
| CSS processing | PostCSS | `^8.5.3` |
| CSS compatibility | Autoprefixer | `^10.4.21` |
| Programming language | JavaScript with JSX | React toolchain |
| Package manager | npm | Lockfile version 3 |

## Project Structure

The following is an overview of the principal files and directories identified during the repository review. It is not intended to replace a complete filesystem listing.

```text
projektiq-frontend-latest/
├── public/
│   └── index.html
│       # HTML document containing the React application root
│
├── src/
│   ├── index.js
│   │   # Application entry point and React root mounting
│   ├── index.css
│   │   # Global styles
│   ├── App.css
│   │   # Application-level CSS
│   ├── App.jsx
│   │   # Router, shared layout and context-provider setup
│   ├── reportWebVitals.js
│   │   # Optional frontend performance measurements
│   │
│   ├── components/
│   │   ├── OrganizationContext.jsx
│   │   │   # Shared organization-selection state
│   │   ├── ProjectContext.jsx
│   │   │   # Shared project-selection state
│   │   ├── OrganizationProtectedRoute.jsx
│   │   │   # Organization-level route protection
│   │   ├── ProjectProtectedRoute.jsx
│   │   │   # Project-level route protection
│   │   ├── SideBar.jsx
│   │   │   # Shared application navigation
│   │   ├── SearchBar.jsx
│   │   │   # Search interface and backend requests
│   │   ├── MyAccount.jsx
│   │   │   # Account information interface
│   │   ├── MyOrganizations.jsx
│   │   │   # Organization overview
│   │   ├── MyProjects.jsx
│   │   │   # Project overview
│   │   └── ...
│   │       # Additional reusable interface components
│   │
│   └── pages/
│       ├── Login.jsx
│       │   # User authentication
│       ├── Signup.jsx
│       │   # Account registration
│       ├── Logout.jsx
│       │   # Session cleanup and logout
│       ├── HomePage.jsx
│       │   # Home/dashboard screen
│       ├── Projects.jsx
│       │   # Project listing
│       ├── Project.jsx
│       │   # Individual project view
│       ├── NewProject.jsx
│       │   # Project creation
│       ├── ProjectManagePage.jsx
│       │   # Project management interface
│       ├── Organization.jsx
│       │   # Organization view
│       ├── NewOrganization.jsx
│       │   # Organization creation
│       ├── NewMember.jsx
│       │   # Add organization members
│       ├── ManageOrganizationMembers.jsx
│       │   # Organization membership management
│       ├── NewProjectMember.jsx
│       │   # Add project members
│       ├── ManageProjectMembers.jsx
│       │   # Project membership management
│       ├── ManageMember.jsx
│       │   # Individual project-member management
│       ├── Tasks.jsx
│       │   # Task listing
│       ├── Task.jsx
│       │   # Individual task view
│       ├── NewTask.jsx
│       │   # Task creation
│       ├── Issues.jsx
│       │   # Issue listing
│       ├── IssuePage.jsx
│       │   # Individual issue view
│       ├── NewIssue.jsx
│       │   # Issue creation
│       ├── ChangeRequest.jsx
│       │   # Individual change request
│       ├── NewChangeRequest.jsx
│       │   # Change request creation
│       ├── RequirementPage.jsx
│       │   # Individual requirement
│       ├── NewRequirement.jsx
│       │   # Requirement creation
│       ├── Schedule.jsx
│       │   # Scheduling and calendar interface
│       ├── Timelogs.jsx
│       │   # Time-log interface
│       ├── ProjectLogs.jsx
│       │   # Project activity logs
│       ├── Chat.jsx
│       │   # Direct/group chat and live updates
│       └── AccessDenied.jsx
│           # Unauthorized-access screen
│
├── package.json
│   # Dependencies and npm scripts
├── package-lock.json
│   # Locked dependency versions
├── .gitignore
│   # Files excluded from version control
└── README.md
    # Project documentation
```

Some filenames and directory entries above represent the principal reviewed files rather than an exhaustive inventory. Consult the repository itself for the complete current tree.

## Architecture and Patterns

### Application entry point

The application is mounted from `src/index.js` using React's root-rendering API. The entry point imports the main application component and global styles.

The main application component, `src/App.jsx`, defines the route configuration and wraps the application with shared context providers.

### Component-based architecture

The frontend separates application screens from reusable components:

- **Pages** represent complete application screens and workflows.
- **Components** provide reusable navigation, search, account, and context functionality.
- **Context providers** share selected project and organization state.
- **Route guards** restrict access to selected management screens based on roles.

The reviewed structure does not show a single central service directory containing every API operation. Several page components perform their own HTTP requests.

### State management

React hooks manage component-level state and side effects.

React Context shares organization and project selection across components. Authentication-related values are persisted in browser storage, while chat manages its WebSocket connection within the chat interface.

### HTTP communication

Axios is used to communicate with the backend over HTTP.

Requests cover authentication, project and organization operations, task management, issue reporting, requirements, change requests, search, scheduling, time logs, and conversations.

Some requests use hard-coded `http://localhost:8000` URLs. A shared configurable API base URL would make development, testing, and deployment easier to manage.

### Real-time communication

The chat interface uses WebSockets for live communication and HTTP requests for operations such as retrieving conversations and updating message state.

WebSocket authentication, reconnection behaviour, and server-side message delivery depend on the backend implementation.

### Authentication and authorization

The login flow requests OAuth tokens from the backend. Selected requests attach bearer tokens, and selected operations include a CSRF token read from browser cookies.

Some management routes use role-aware protection components.

Frontend route protection is a user-interface control, not a security boundary. The backend must independently verify the user's identity, role, organization membership, and permissions.

### Responsive interface and visualisation

The dependency set includes Material UI, calendar components, scheduling tools, and Gantt-related packages. These support the application's interface and project-planning visualisations.

The presence of a dependency alone does not guarantee that every library is actively used in a production screen.

## Data Models

The frontend consumes JSON objects supplied by the backend. It does not define a single authoritative model or schema layer for all entities.

| Model / Concept | Relevant Files | Key Fields or Information |
|---|---|---|
| User / Account | `pages/Login.jsx`, `components/MyAccount.jsx`, `components/SearchBar.jsx` | User ID, username, account information |
| Organization | `pages/Organization.jsx`, `pages/NewOrganization.jsx`, `components/OrganizationContext.jsx` | Organization ID, name, members |
| Organization Membership | `pages/ManageOrganizationMembers.jsx`, `pages/NewMember.jsx` | Member details, role, approval status where supplied |
| Project | `pages/Projects.jsx`, `pages/Project.jsx`, `pages/NewProject.jsx`, `components/ProjectContext.jsx` | Project ID, name, description, dates, status and participating organizations |
| Project Membership | `pages/ManageProjectMembers.jsx`, `pages/NewProjectMember.jsx`, `pages/ManageMember.jsx` | Member details and assigned role |
| Task | `pages/Tasks.jsx`, `pages/Task.jsx`, `pages/NewTask.jsx` | Task identifier and task-related project/member information |
| Issue | `pages/Issues.jsx`, `pages/IssuePage.jsx`, `pages/NewIssue.jsx` | Issue identifier and issue details |
| Change Request | `pages/ChangeRequest.jsx`, `pages/NewChangeRequest.jsx` | Change-request identifier and request details |
| Requirement | `pages/RequirementPage.jsx`, `pages/NewRequirement.jsx` | Requirement identifier and requirement details |
| Time Log | `pages/Timelogs.jsx` | Time-entry identifiers and time-log details |
| Project Log | `pages/ProjectLogs.jsx` | Project activity and log information |
| Conversation | `pages/Chat.jsx` | Conversation ID, subject, participants, group status and messages |
| Message | `pages/Chat.jsx` | Message ID, sender, content and read state |

The backend defines the authoritative schema, relationships, validation rules, and persistence behaviour. Confirm exact field names and types against its models or API documentation.

## Services and API Layer

The frontend performs API operations from page and component files rather than relying exclusively on a central service layer.

| Service / Area | Transport | Purpose |
|---|---|---|
| Authentication | HTTP REST using Axios | Obtain and refresh OAuth tokens |
| Projects | HTTP REST | Retrieve and create projects |
| Organizations | HTTP REST | Create and retrieve organizations |
| Membership | HTTP REST | Add and manage organization and project members |
| Tasks | HTTP REST | Retrieve, create and manage tasks |
| Issues | HTTP REST | Retrieve and create issues |
| Requirements | HTTP REST | Retrieve and create requirements |
| Change Requests | HTTP REST | Retrieve and create change requests |
| Scheduling | HTTP REST | Retrieve scheduling-related data |
| Time Tracking | HTTP REST | Retrieve and manage time logs |
| Project Activity | HTTP REST | Retrieve project logs |
| Search | HTTP REST | Search for users and backend-provided results |
| Conversations | HTTP REST | Retrieve and create conversations |
| Live Chat | WebSocket | Receive and exchange real-time chat updates |
| CSRF Handling | Browser cookies and HTTP headers | Read CSRF cookies and attach tokens to selected requests |

### Recommended API organisation

As the application grows, API requests could be consolidated into a dedicated directory:

```text
src/
├── api/
│   ├── client.js
│   ├── authApi.js
│   ├── projectsApi.js
│   ├── organizationsApi.js
│   ├── tasksApi.js
│   ├── issuesApi.js
│   ├── requirementsApi.js
│   └── chatApi.js
```

This is a recommended future structure, not a claim that these files already exist. A central client can standardise base URLs, authorization headers, error handling, and token-refresh behaviour.

## Navigation and Routing

Routes are configured in `src/App.jsx` using React Router DOM.

The following diagram summarises the main navigation areas and route patterns identified during the review.

```text
/
├── /login
├── /signup
├── /logout
├── /unauthorized
│
├── /organization
│   ├── /create_organization
│   ├── /new_member
│   └── /manage_members
│
├── /projects
│   ├── /project/:id
│   ├── /new_project
│   ├── /project_management
│   ├── /new_project_member
│   ├── /manage_project_members
│   ├── /manage_member/:id
│   └── /project_logs
│
├── /tasks
│   ├── /task
│   └── /new_task
│
├── /issues
│   ├── /issue/:id
│   └── /new_issue
│
├── /change_request/:id
├── /new_change_request
│
├── /requirement/:id
├── /new_requirement
│
├── /schedule
├── /timelogs
└── /chat
```

The route paths above are a high-level summary. Verify exact path matching and parent-child nesting against `src/App.jsx` before using them as a formal routing contract.

### Access control

Selected organization and project management routes use protected-route components and role lists.

Some routes are associated with roles such as `Admin` and `General Manager`. The backend must enforce the same permissions independently.

## Administration and Membership

| Page / Route | Scope | Route-Level Protection |
|---|---|---|
| `/project_management` | Project management interface | Admin, General Manager |
| `/new_member` | Add an organization member | Admin, General Manager |
| `/manage_members` | Manage organization membership | Admin, General Manager |
| `/new_project_member` | Add a project member | No route guard declared in the reviewed route table |
| `/manage_project_members` | Manage project membership | Admin, General Manager |
| `/manage_member/:id` | Manage an individual project member | Admin, General Manager |

The absence of a frontend route guard does not mean an operation should be available to everyone. Enforce authorization on the backend.

## Configuration

### Environment variables

The reviewed frontend references these Create React App environment variables:

| Variable | Purpose | Notes |
|---|---|---|
| `REACT_APP_CLIENT_ID` | OAuth client identifier | Must match the client configured on the backend |
| `REACT_APP_CLIENT_SECRET` | Referenced in OAuth token requests | A confidential secret must not be exposed in a browser bundle |

Example local environment configuration:

```dotenv
REACT_APP_CLIENT_ID=your_oauth_client_id
```

Do not place a confidential OAuth client secret in the frontend's `.env` file. Create React App embeds `REACT_APP_*` values into the client-side build, making them accessible to users.

Use an authentication flow suitable for public clients, such as Authorization Code with PKCE, or perform confidential-client operations on a trusted backend.

### Backend URL

Several API calls use a hard-coded backend URL:

```text
http://localhost:8000
```

This is suitable only when the backend is accessible at that address from the browser.

When the frontend is hosted remotely, `localhost` refers to the end user's own machine, not the deployed backend server.

Centralise the API base URL and configure it for each environment. No shared API-base environment variable was identified in the reviewed files.

### Configuration files

| File | Purpose |
|---|---|
| `package.json` | Dependencies and npm scripts |
| `package-lock.json` | Resolved dependency tree |
| `public/index.html` | HTML application shell |
| `src/index.js` | React application entry point |
| `src/App.jsx` | Route and provider configuration |
| `src/index.css` | Global styling |
| `.gitignore` | Version-control exclusions |

## Getting Started

### Prerequisites

Install the following before starting development:

- Node.js compatible with the project's React Scripts toolchain.
- npm.
- Git.
- Access to a running ProjektIQ backend.
- Valid backend OAuth client configuration.

### 1. Clone the repository

```bash
git clone https://github.com/munacips/projektiq-frontend-latest.git
cd projektiq-frontend-latest
```

### 2. Install dependencies

Install the versions recorded in the lockfile:

```bash
npm ci
```

If you intentionally modify dependencies, use `npm install` and commit the resulting lockfile changes.

### 3. Configure environment variables

Create a `.env` file in the repository root:

```dotenv
REACT_APP_CLIENT_ID=your_oauth_client_id
```

Configure the backend to match the authentication flow expected by the frontend. Do not expose confidential secrets in client-side configuration.

### 4. Start the backend

Start the backend separately and ensure it is accessible at the URL expected by the frontend.

The current implementation includes requests to:

```text
http://localhost:8000
```

Confirm that the backend's API, OAuth endpoints, CORS policy, and WebSocket configuration are available before testing authenticated features.

### 5. Start the frontend

Run the development server:

```bash
npm start
```

The application normally becomes available at:

```text
http://localhost:3000
```

The repository's npm scripts should be checked for operating-system-specific commands. If a script uses Windows-specific `set` syntax, adjust it or use a cross-platform alternative when developing on Linux or macOS.

### 6. Run tests

Start the test runner:

```bash
npm test
```

Create React App's test runner normally starts in interactive watch mode. Press `q` to quit.

### 7. Create a production build

Generate the optimised static application:

```bash
npm run build
```

The production output is written to the `build/` directory.

## Backend Requirements

The frontend requires a separate backend API. The following table identifies concrete endpoint paths observed in the reviewed implementation and groups other integration areas whose exact paths should be verified against the corresponding source files.

| Area | HTTP Method | Endpoint / Contract |
|---|---|---|
| OAuth token acquisition and refresh | POST | `/o/token/` |
| User search | GET | `/search_users/?query=...` |
| General search | GET | `/search/?query=...` |
| Current user's projects | GET | `/my_projects/` |
| Create project | POST | `/projects/` |
| Current user's conversations | GET | `/my_conversations/` |
| Create conversation | POST | `/create_conversation/` |
| Update message/read state | PATCH | `/messages/{id}/` |
| Organizations | GET, POST and other operations as implemented | Verify exact paths in organization-related pages |
| Organization membership | GET, POST and other operations as implemented | Verify exact paths in membership-related pages |
| Project details | GET, POST and other operations as implemented | Verify exact paths in project-related pages |
| Project membership | GET, POST and other operations as implemented | Verify exact paths in project-membership pages |
| Tasks | GET, POST and other operations as implemented | Verify exact paths in task-related pages |
| Issues | GET, POST and other operations as implemented | Verify exact paths in issue-related pages |
| Requirements | GET, POST and other operations as implemented | Verify exact paths in requirement-related pages |
| Change requests | GET, POST and other operations as implemented | Verify exact paths in change-request pages |
| Scheduling | GET and other operations as implemented | Verify exact paths in scheduling-related pages |
| Time logs | GET, POST and other operations as implemented | Verify exact paths in time-log pages |
| Project logs | GET | Verify exact path in `ProjectLogs.jsx` |
| Live chat | WebSocket | Confirm the exact WebSocket URL and authentication contract in the implementation and backend |

The table is not a substitute for a complete backend API specification. Endpoint paths and methods not explicitly verified should be confirmed before implementing new integrations.

### Backend integration checklist

- Configure CORS to allow the frontend origin.
- Confirm that the OAuth client and token grant flow match the frontend's authentication implementation.
- Return the JSON fields expected by the relevant page components.
- Enforce authentication and authorization for protected operations.
- Configure CSRF handling where required by the backend.
- Expose the appropriate WebSocket endpoint for live chat.
- Configure the frontend to use the correct API origin for each environment.
- Return predictable error responses so the frontend can handle failures consistently.

## Testing

Run the available test suite:

```bash
npm test
```

The project declares React Testing Library, Jest DOM, and user-event utilities for component and interaction testing.

Useful areas to cover include:

- Authentication and logout flows.
- Route protection and role restrictions.
- Project and organization forms.
- Task, issue, requirement, and change-request workflows.
- API loading, error, and empty states.
- Token-expiration handling.
- Membership permissions.
- Chat connection lifecycle and message updates.

These are recommended testing priorities, not a claim that tests for every scenario already exist.

## Build and Deployment

### Production build

Install dependencies and generate the static production bundle:

```bash
npm ci
npm run build
```

Deploy the generated `build/` directory to a static web host or web server.

### Hosting requirements

Configure the hosting environment to:

- Serve the compiled JavaScript, CSS, and static assets.
- Return `index.html` for supported client-side routes.
- Use the correct backend API URL.
- Serve the application over HTTPS in production.
- Configure the backend's CORS and CSRF policies.
- Configure WebSocket connectivity for chat.
- Ensure OAuth configuration matches the deployed environment.

Without history fallback, opening a nested route directly or refreshing the page may return a server-side 404 even when navigation works inside the application.

### Docker

A repository-specific Dockerfile or Compose configuration was not verified during the review. The commands below are therefore for a standard static frontend build, not an existing Docker setup.

To produce the static build:

```bash
npm ci
npm run build
```

A future container deployment could use a multi-stage build: compile the React application with Node.js, then serve the resulting static files through Nginx or another web server.

### CI/CD

Automated deployment should run dependency installation, tests, and the production build before publishing the frontend.

A typical pipeline would execute:

```bash
npm ci
npm test -- --watchAll=false
npm run build
```

The actual command behaviour should be verified against the installed React Scripts version and the repository's test configuration.

## Security Considerations

### Client-side credentials

Never rely on frontend environment variables to protect confidential credentials. Variables prefixed with `REACT_APP_` are included in the client bundle.

### Token storage

The current implementation stores authentication-related values in browser storage. Consider the security implications of storing bearer and refresh tokens in `localStorage`, particularly if an attacker can execute JavaScript through a cross-site scripting vulnerability.

Use appropriate token lifetimes, refresh-token rotation where supported, and robust input handling.

### Authorization

Protected React routes improve the user experience but cannot prevent direct API calls. Every protected backend operation must independently validate authentication, membership, roles, and permissions.

### Transport security

Use HTTPS for production API calls and secure WebSocket connections. Avoid sending credentials over unencrypted connections in production.

## Developer Notes

### 1. Centralise API requests

Move repeated Axios configuration into a shared client module. This reduces duplication and provides a consistent location for authentication headers, base URLs, and error handling.

### 2. Make API configuration environment-aware

Replace hard-coded backend URLs with a configurable API origin. Ensure the frontend works correctly in local development, staging, and production.

### 3. Keep the backend contract explicit

Document endpoint paths, request payloads, response schemas, and error formats. Consider maintaining an OpenAPI specification so frontend and backend developers can work against a shared contract.

### 4. Keep access control consistent

Use frontend route guards for navigation and user feedback, but implement all authoritative permission checks on the backend.

### 5. Maintain reproducible builds

Use `npm ci` for clean installations and commit changes to `package-lock.json` when dependencies change.

### 6. Improve cross-platform development

Review npm scripts that rely on Windows-specific command syntax and replace them with cross-platform alternatives where appropriate.

### 7. Expand automated tests

Prioritise critical workflows such as authentication, project creation, membership management, task operations, and chat. Include tests for both successful operations and API failures.

---

**ProjektIQ — A central workspace for project coordination, execution, and lifecycle management.**
