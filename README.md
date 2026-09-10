# Secure Task Manager — WSO2 Project (2 points)

Built with **WSO2 Asgardeo** (authentication + Email OTP MFA + self-registration) + **WSO2 Ballerina** (REST API) + React.

This project is submitted as evidence for **“Use WSO2 in a real project (2 points)”** for WSO2 Engineering Internship.

## Why WSO2?
- **Asgardeo:** OAuth2/OIDC login, no custom password code, Email OTP multi-factor auth, branded login screen, self-registration
- **Ballerina:** Backend REST API for tasks, CORS enabled for React, deployed locally on :9090
- Real integration: React -> Asgardeo (login) -> Ballerina API (tasks CRUD)

## Architecture
```
User -> React (localhost:5173) -> Asgardeo login (api.asgardeo.io/t/fathimamufasa)
     -> After login -> React calls Ballerina API (localhost:9090/api/tasks)
```

## Features
- Sign In with Asgardeo, Sign Out
- Shows authenticated user name/email
- Email OTP MFA enabled
- Tasks: Create, List, Toggle Done, Delete via Ballerina API
- Health check: GET /api/health

## How to Run

### 1. Backend (Ballerina)
```powershell
cd task-api
$env:Path += ";C:\Program Files\Ballerina\bin"
bal run
# runs on http://localhost:9090/api/health
```

API:
- GET http://localhost:9090/api/tasks
- POST http://localhost:9090/api/tasks {"title":"Buy milk"}
- PUT http://localhost:9090/api/tasks/1 {"title":"Buy milk","done":true}
- DELETE http://localhost:9090/api/tasks/1

### 2. Frontend (React + Asgardeo)
```powershell
cd task-ui
npm install
npm run dev
# open http://localhost:5173
```

Asgardeo config:
- ClientID: PythFWkwZu85wjux0kTu2ovZQkYa
- BaseUrl: https://api.asgardeo.io/t/fathimamufasa
- Redirect: http://localhost:5173
- SDK: @asgardeo/auth-react

## Screenshots for Evidence
1. Asgardeo login screen with brand color #FF7300
2. Logged-in app showing username + tasks
3. Ballerina terminal `bal run` + health response
4. GitHub repo + commits

## Author
Farees Fathima Mufasa — Faculty of Computing Student, Sri Lanka
GitHub: https://github.com/Fathima-Mufasa
LinkedIn: in/farees-mufasa
