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
| CSS
