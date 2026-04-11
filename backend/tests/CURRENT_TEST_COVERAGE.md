# Current Test Coverage

This document lists what the repository is currently testing, what test code exists but is separate from the main backend API suite, and what is still not covered.

## Active Automated Coverage

### Backend API suite currently used for regression checks

Primary file:
- [backend/tests/plan-routes.test.js](c:/Users/nabee/OneDrive/Documents/VSCode Projects/parenting_project/backend/tests/plan-routes.test.js)

Run command:

```powershell
cd backend
npm test
```

Current automated backend API coverage:

1. `POST /api/plan`
   - verifies a plan is created for `req.user.uid`
   - verifies a linked case is created and attached to the plan
2. `GET /api/plan/:uid/all`
   - verifies a user can read their own plans
   - verifies the query filter uses the authenticated uid
3. `GET /api/plan/:uid/all`
   - verifies a user cannot request another user's plans
4. `POST /api/plan/delete`
   - verifies an owned plan can be deleted
5. `POST /api/plan/delete`
   - verifies a non-owned plan cannot be deleted
6. `POST /api/plan/:planId/answer`
   - verifies a new question answer is appended and saved
7. `POST /api/plan/updateCurrent/:planId/:currQId`
   - verifies the current question pointer is updated and saved
8. `POST /api/plan/:planId/time-and-communication`
   - verifies the full section payload is stored on the plan

Those are separate from the current backend API regression command. They are not run by `cd backend && npm test`.

## What Is Currently Being Tested

At a practical level, the active backend API suite is testing these behaviors:

- authenticated ownership on key plan routes
- plan creation
- plan deletion authorization
- plan answer persistence
- resume-progress persistence through `currentQuestion`
- full-section persistence for `timeAndCommunication`

The existing frontend test files indicate there is also some component/page-level UI coverage in the repo, but that coverage is separate from the current backend API suite and is not documented as part of the active API regression workflow.

## What Is Not Currently Tested By The Backend API Suite

The current backend API suite does not cover these `plan` routes:

- `GET /api/plan/:planId/current`
- `GET /api/plan/:planId`
- `POST /api/plan/:planId/contact`
- `POST /api/plan/:planId/children`
- `POST /api/plan/setShareMode/:planId`

The current backend API suite also does not cover these important `plan` route behaviors:

- updating an existing answer in `POST /api/plan/:planId/answer`
- pruning later answers after an earlier answer changes
- forbidden access on `POST /api/plan/:planId/answer`
- forbidden access on `POST /api/plan/:planId/time-and-communication`
- case cleanup behavior when deleting a plan linked to a case
- error paths when model operations throw

## What Is Not Currently Tested End-To-End

These important real-world integrations are not covered by the current automated backend API suite:

- real Firebase token verification through `admin.auth().verifyIdToken(...)`
- real MongoDB reads and writes against a live database
- real SMTP email delivery
- full frontend-to-backend flows in a browser
- Docker-based startup and environment wiring

## Manual Testing Still Needed

Even with the current automated backend API suite, these areas still need manual validation:

- dashboard plan lifecycle
- page-to-page navigation
- section state recovery after returning to a page
- refresh and resume behavior
- sign-in and sign-out flows
- invite UX and email delivery
- any UI-specific validation or rendering behavior