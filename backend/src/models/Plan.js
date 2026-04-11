const mongoose = require('mongoose');

const questionResponseSchema = new mongoose.Schema(
{
  qKey: { 
    type: String, 
    required: true 
  },
  answer: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  isFlagged: {
    // future proofing for potential "flagging" a question feature to come back to later
    type: Boolean,
    required: true,
    default: false },
  isDeferred: {
    // future proofing for potential of deferring a question feature to come back to later
    type: Boolean,
    required: true,
    default: false },
  timestamp: { type: Date, default: Date.now }
});

const childSchema = new mongoose.Schema(
{
  fName: { 
    type: String, 
    required: true 
  },
  lName: { 
    type: String, 
    required: true 
  },
  birthday: {
    type: String,
    required: true,
  },
  isEmancipatedAdult: {
    type: Boolean,
    required: true,
  },
  timestamp: { type: Date, default: Date.now }
});

const timeAndCommunicationSchema = new mongoose.Schema(
{
  agreeToTransportationPolicy: {
    type: Boolean,
    default: false
  },
  transportationArrangementDescription: {
    type: String,
    default: ''
  },
  agreeToActivityPolicy: {
    type: Boolean,
    default: false
  },
  activityPolicyDescription: {
    type: String,
    default: ''
  },
  parentingSchedule: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  communicationWithCoParentOnPhone: {
    type: String,
    default: ''
  },
  communicationWithCoParentOnPhoneDescription: {
    type: String,
    default: ''
  },
  notifyCoParentOfChildRelatedEvents: {
    type: String,
    default: ''
  },
  notifyCoParentOfChildRelatedEventsDescription: {
    type: String,
    default: ''
  }
}, { _id: false });

const planSchema = new mongoose.Schema(
{
  userID: { 
    type: String, 
    required: true 
  },
  name: {
    type: String,
    default: 'Untitled Plan'
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  status: { 
    type: String, enum: ['in_progress', 'completed', 'ready_for_review', 'DRAFT'], 
    default: 'in_progress' 
  },
  currentQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  },
  allowSharing: {
    type: Boolean,
    required: true,
    default: false
  },
  isShared: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: String,
    required: true,
    default: new Date().toLocaleDateString('en-US')
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    default: null
  },
  timeAndCommunication: {
    type: timeAndCommunicationSchema,
    default: () => ({})
  },
  answers: [questionResponseSchema],
  children: [childSchema]
})

module.exports = mongoose.model('Plan', planSchema);
