# Test Suite

This project currently uses:

- automated backend API tests
- manual frontend workflow tests

The split is intentional:
- API correctness, ownership, validation, and database writes are automated on the backend
- page flow, navigation, visual behavior, and browser recovery are tested manually on the frontend

command:
cd backend
npm run test:api

## Automated Backend API Tests

Automated backend API tests live in:
- `backend/tests/`

Primary command:
```powershell
cd backend
npm test
```

API-only command:
```powershell
cd backend
npm run test:api
```

Expected console output:
- Node's `spec` reporter prints a separate line for each test
- passing tests display a green check mark
- a green check mark means that the backend API behavior being tested worked as expected for that scenario

## Current Automated Test Counts

When you run:

```powershell
cd backend
npm test
```

you are currently running:
- 8 backend API tests

When you run:

```powershell
cd backend
npm run test:api
```

you are currently running:
- 8 backend API tests

## Automated Backend API Test Cases

### 1. `POST /api/plan` creates a plan for the authenticated user
File:
- `backend/tests/plan-routes.test.js`

What it tests:
- the route creates a plan using `req.user.uid`
- a linked case is created for the new plan

How it is run:
- included in `npm test`
- or run with `npm run test:api`

What success looks like:
- response status is `201`
- the created plan belongs to the authenticated user
- the case link is attached to the plan

Why it is important:
- plan creation is the entry point for the full questionnaire flow

### 2. `GET /api/plan/:uid/all` returns only the authenticated user's plans
File:
- `backend/tests/plan-routes.test.js`

What it tests:
- the route returns plans only when the requested uid matches the authenticated uid

How it is run:
- included in `npm test`
- or run with `npm run test:api`

What success looks like:
- response status is `200`
- the query filter uses the authenticated user id

Why it is important:
- users should not be able to read other users' plans

### 3. `GET /api/plan/:uid/all` rejects a mismatched user id
File:
- `backend/tests/plan-routes.test.js`

What it tests:
- the route blocks requests for another user's plan list

How it is run:
- included in `npm test`
- or run with `npm run test:api`

What success looks like:
- response status is `403`
- the plan query is not executed

Why it is important:
- this is a direct ownership and authorization check

### 4. `POST /api/plan/delete` deletes an owned plan
File:
- `backend/tests/plan-routes.test.js`

What it tests:
- the route deletes a plan when it belongs to the authenticated user

How it is run:
- included in `npm test`
- or run with `npm run test:api`

What success looks like:
- response status is `200`
- the plan delete operation runs

Why it is important:
- stale or undeletable plans cause lifecycle confusion in the dashboard

### 5. `POST /api/plan/delete` rejects deleting another user's plan
File:
- `backend/tests/plan-routes.test.js`

What it tests:
- the route refuses deletes when the plan is not owned by the authenticated user

How it is run:
- included in `npm test`
- or run with `npm run test:api`

What success looks like:
- response status is `401`
- no delete occurs

Why it is important:
- prevents one user from deleting another user's data

### 6. `POST /api/plan/:planId/answer` saves a new answer
File:
- `backend/tests/plan-routes.test.js`

What it tests:
- a question answer is added to the plan and persisted

How it is run:
- included in `npm test`
- or run with `npm run test:api`

What success looks like:
- response status is `201`
- the answer appears in `plan.answers`

Why it is important:
- this is the core questionnaire save path

### 7. `POST /api/plan/updateCurrent/:planId/:currQId` updates the current question
File:
- `backend/tests/plan-routes.test.js`

What it tests:
- the plan's current question pointer is updated correctly

How it is run:
- included in `npm test`
- or run with `npm run test:api`

What success looks like:
- response status is `200`
- `currentQuestion` is updated to the requested id

Why it is important:
- resume behavior depends on this field

### 8. `POST /api/plan/:planId/time-and-communication` saves the full section payload
File:
- `backend/tests/plan-routes.test.js`

What it tests:
- the time-and-communication section payload is normalized and saved onto the plan

How it is run:
- included in `npm test`
- or run with `npm run test:api`

What success looks like:
- response status is `201`
- all section fields are written into `plan.timeAndCommunication`

Why it is important:
- this section stores multiple UI fields at once and is more fragile than a single-answer route

## Manual Frontend Tests

Manual frontend testing should focus on browser behavior, page flow, and state recovery.

Recommended manual checklist:

### 1. Create a new plan from the dashboard
What it tests:
- the dashboard can create a plan and open a clean flow

How it is run:
- sign in
- click `New Plan`

What success looks like:
- a new plan card appears
- opening the plan starts a clean questionnaire state

Why it is important:
- verifies the primary user starting flow

### 2. Open an existing plan
What it tests:
- the selected plan resumes correctly

How it is run:
- create or use an existing plan
- click `Open Plan` or `Resume Plan`

What success looks like:
- the correct plan loads
- previously saved data appears instead of stale data from another plan

Why it is important:
- prevents cross-plan data contamination

### 3. Delete a plan from the dashboard
What it tests:
- delete UX and backend delete behavior together

How it is run:
- click the trash/delete control for a plan
- confirm deletion

What success looks like:
- the plan disappears from the dashboard
- refreshing does not bring it back

Why it is important:
- users need predictable plan lifecycle behavior

### 4. Click Next on Getting Started
What it tests:
- the first page transitions correctly into the questionnaire flow

How it is run:
- open a plan
- complete the required Getting Started fields
- click `Next`

What success looks like:
- the app moves to the next page
- the next page opens at the top

Why it is important:
- this is the gateway into the question-driven flow

### 5. Click Next on Parental Rights
What it tests:
- the current answer is saved and the page advances

How it is run:
- answer the Parental Rights question
- click `Next`

What success looks like:
- the app moves to `Parenting Time & Communication`
- returning to Parental Rights shows the saved answer

Why it is important:
- validates the main section-to-section save-and-continue behavior

### 6. Return to a previous page and verify saved state
What it tests:
- section values persist when navigating back

How it is run:
- answer one or more sections
- navigate away and back

What success looks like:
- the previously entered values are still present

Why it is important:
- state loss during navigation is one of the highest-risk user-facing regressions

### 7. Delete all plans, then create a new one
What it tests:
- old values do not leak into a fresh plan after deletion

How it is run:
- delete all existing plans
- create a new plan
- open it

What success looks like:
- the new plan starts blank
- old contact info and answers do not reappear

Why it is important:
- this directly checks the stale-state regression that has appeared before

### 8. Refresh the browser and resume a plan
What it tests:
- saved plan state can be recovered after a browser refresh

How it is run:
- answer some questions
- refresh the browser
- reopen or resume the plan

What success looks like:
- the plan can still be resumed
- saved content remains correct

Why it is important:
- users will naturally refresh or revisit the app mid-flow
