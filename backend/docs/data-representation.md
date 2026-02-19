# ShareCare Data Representation: The Plan Object

## Overview
This document outlines the data representation for a user's active session in the ShareCare application. To optimize for fast read/write operations in our MongoDB database, we are utilizing an **Embedded Document Pattern**. 

Instead of creating separate database rows for every answer a user gives, we maintain a single root `Plan` object. This object contains an embedded array of `children` representing the questions the user has answered so far, along with their specific responses.

It is easiest to think of this Plan Data Structure as a Tree, where the root is the Plan with is specifier attributes (PlanID, UserId), and the children of the Plan are a list of Questions. **Pending Future Documentation**




## Schema Definition

### 1. The Root: `Plan` Object
The `Plan` object acts as the primary wrapper for a user's session. It tracks who owns the plan and maintains the array of completed steps.

* **`planID`** *(String)*: The unique identifier for this specific form session/draft.
* **`userID`** *(String)*: The unique identifier (from Firebase Auth) of the parent filling out the form.
* **`status`** *(String)*: The current state of the plan (e.g., `in_progress`, `completed`, `ready_for_review`).
* **`children`** *(Array of Objects)*: An ordered list of the question nodes the user has traversed and answered.

### 2. The Embedded Array: `Question` Object
Each object inside the `children` array represents a resolved node in our decision tree. 

* **`questionID`** *(String)*: The unique ID linking back to the static administrative graph (e.g., `Q1`, `Q2`).
* **`answer`** *(Mixed)*: The user's submitted response to this specific question. The data type depends on the question (String for multiple-choice, Boolean for toggles, Number for financial inputs).
* **`timestamp`** *(Date)*: When the user answered this specific question, useful for analytics and state recovery.

## Visual Representation 

### Acyclic Graph
```
               Plan
             /      \
            /        \
          Q1    ->    Q2
          |           |
        "Ans1"     "Ans2" .....
```

### Directory Style
```
Plan (Root Document)
├── planID: String
├── userID: String
├── status: String
└── children: Array of Objects
    ├── [0] Question Object
    │   ├── questionID: "Q1"
    │   └── answer: "yes"
    └── [1] Question Object
        ├── questionID: "Q2"
        └── answer: "Parent 1"
```


## Example JSON Payload

```json
{
  "planID": "plan1",
  "userID": "user_2",
  "status": "in_progress",
  "children": [
    {
      "questionID": "Q1",
      "answer": "yes",
      "timestamp": "2026-02-19T14:22:10Z"
    },
    {
      "questionID": "Q2",
      "answer": "Parent 1",
      "timestamp": "2026-02-19T14:23:05Z"
    }
  ]
}
```