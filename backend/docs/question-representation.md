# ShareCare Data Representation: The Question Object

## Overview
This document outlines the data representation for a question in the ShareCare application. To optimize for fast read/write operations in our MongoDB database, we are utilizing an **Embedded Document Pattern**. 

Questions used in the application are sourced from the `Question` object. This object contains all relevant information about a question: the format of question, the question text, evaluation conditions, and the id of followup questions.

A Question object will use its evaluation conditions to assist in pointing to the next Question a user will be asked after answering the current Question.

## Schema Definition

### 1. The Root: `Question` Object
The `Question` object contains core information about the Question itself.

* **`type`** *(String)*: The kind of question being asked (e.g., `multiple choince`, `integer input`, `checkbox`).
* **`qText`** *(String)*: The question text of the question being asked.
* **`qKey`** *(String)*: A short description of the question for ease of querying (e.g., `income_level`, `criminal_record`, `has_insurance`).
* **`section`** *(String)*: The section of the decision tree this question falls under.
* **`nextQuestions`** *(Array of Objects)*: A list of rules that can be used to evaluate which question is next. Follows the embedded NextRule Object schemea.
* **`isDefault`** *(Boolean)*: True if there is a default next question no matter the answer. Default is false.
* **`options`** *(Array of Objects)*: Each object in this array has a `label` *(String)*, and a `value` *(Mixed)*. These options are usually sample answers for questions like multiple choice responses or checkbox responses.

### 2. The Embedded Array: `NextRule` Object
Each object inside the `nextQuestions` array represents a rule object that contains logic to evaluate our decision tree route for a particular condition. 

* **`condition`** *(Object)*: An object that follows the Condition Object schema. Contains an operator and a value that if they resolve to true along with a user's answer, routes them to the question specified in the `goTo` attribute of the `NextRule` object.
* **`goTo`** *(ObjectId)*: The ObjectId of the question to route to after the condition has been fufilled.


### 3. The Embedded Object: `Condition` Object
Contains an operator and a value.

* **`operator`** *(String)*: The type of operator to perform on the value and user answer (e.g., `eq`, `neq`, `lt`, `lte`, `gt`, `gte`).
* **`value`** *(Mixed)*: The value a user's answer will be compared with

## Example JSON Payload

```json
{
  "type": "multiple choice",
  "qText": "Do you have insurance",
  "qKey": "have_insurance",
  "section": "Insurance",
  "nextQuestions": [
    {
      "condition": {
        "operator": "eq",
        "value": True
      },
      "goTo": "Q1",
    },
    {
      "condition": {
        "operator": "eq",
        "value": False
      },
      "goTo": "Q2",
    }
  ],
  "isDefault": False,
  "options": [
    {
        "label": "Yes",
        "value": True,
    },
    {
        "label": "No",
        "value": False,
    },
  ],
  "timestamp": "2026-02-19T14:23:05Z"
}
```

In this example, if a User has insurance and they answer "Yes" (True), the NextRule will evaluate that the user be routed to Question 1 (Q1) since the operator "eq" finds that True and True are equal. If they had answered False, they would be routed to Question 2 (Q2) 