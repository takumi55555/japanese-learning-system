const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    enrollment_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    student_id: {
      type: String,
      required: true,
      index: true,
    },
    course_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    ticket_id: {
      type: String,
      required: true,
      index: true,
    },
    enrolled_date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    progress_status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "enrollments",
  }
);

// Compound index to ensure one student can only have one enrollment per course
enrollmentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

// Index for efficient queries
enrollmentSchema.index({ student_id: 1, enrolled_date: -1 });
enrollmentSchema.index({ ticket_id: 1 });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;

