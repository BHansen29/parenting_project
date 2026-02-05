// This file defines a template-style Document schema shape

const mongoose = require('mongoose');

const QUESTION_TYPES = [
  'text',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'date',
  'number',
  'boolean'
];

// this schema adds optional rules for a question, like a maximum or minimum value
const validationSchema = new mongoose.Schema(
  {
    min: Number,
    max: Number,
    pattern: String
  },
  { _id: false }
);

// this schema implements conditional display logic, dependsOn makes a question depend on another question's or user's id
const visibilitySchema = new mongoose.Schema(
  {
    dependsOn: String,
    equals: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

// the schema for a question, a question requires an id, a label (the actual question), and a type. The required field adds functionality for whether a question is required or optional.
const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: QUESTION_TYPES
    },
    required: {
      type: Boolean,
      default: false
    },
  },
  { _id: false }
);

// this defines a section, or a group of questions. A section has an id, title, and optionally a description. The questions field is an array so it has multiple "questionSchema" within a section.
const sectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    order: {
      type: Number,
      required: true,
      default: 0
    },
    questions: {
      type: [questionSchema],
      default: []
    }
  },
  { _id: false }
);

// this is the document as a whole. A document has a title, a version, whether it is active or not, and multiple sections, like how a section has multiple questions.
const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      required: true,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sections: {
      type: [sectionSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// The code below validates the questions throughout a document and make sure there are no duplicate IDs.
documentSchema.path('sections').validate(function validateUniqueQuestionIds(sections) {
  const seenIds = new Set();

  for (const section of sections || []) {
    for (const question of section.questions || []) {
      if (!question.id) {
        continue;
      }

      if (seenIds.has(question.id)) {
        return false;
      }

      seenIds.add(question.id);
    }
  }

  return true;
}, 'Question IDs must be unique within a document');

module.exports = mongoose.model('Document', documentSchema);
