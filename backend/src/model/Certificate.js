const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    issuedBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "certificates",
  }
);

// Compound indexes only (single-field indexes already defined via index: true in schema)
certificateSchema.index({ userId: 1, issueDate: -1 });

const Certificate = mongoose.model("Certificate", certificateSchema);

module.exports = Certificate;

