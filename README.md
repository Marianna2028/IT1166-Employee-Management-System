# Employee Management System

## Requirements
- Node.js 20 or newer

## Install and run
```terminal
npm install
npm start
```
Open http://127.0.0.1:3000

## Demonstration accounts
All accounts initially use `Capstone123!`.
- `demo.employee` — Employee
- `sample.manager` — Manager
- `test.hradmin` — HRAdmin
- `system.admin` — SystemAdmin

All employee records use explicitly synthetic labels, reserved `.test` addresses, and fictional 555 numbers.

## Design-aligned controls
- Express REST API and private JSON database
- One `public/index.html` file served at `/` and protected `/dashboard`, with mutually exclusive views
- Session authentication, CSRF token, Helmet headers, request-size limits
- Role and record-scope authorization
- Password hashes using bcrypt
- Optimistic record versions and HTTP 409 conflicts
- Serialized temporary-file plus atomic-rename writes
- Employee, leave, attendance, headcount, and audit functionality
