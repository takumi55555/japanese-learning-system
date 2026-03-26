const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: true,
      unique: true,
    },
    course_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    purchased_by: {
      type: String, // group_admin_id
      required: true,
      index: true,
    },
    assigned_to: {
      type: String, // student_id (userId)
      default: null,
      index: true,
    },
    assigned_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["unused", "assigned", "in_use", "completed", "cancelled"],
      default: "unused",
      index: true,
    },
    order_id: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "tickets",
  }
);

// Index for efficient queries
ticketSchema.index({ purchased_by: 1, status: 1 });
ticketSchema.index({ assigned_to: 1, course_id: 1 });
ticketSchema.index({ course_id: 1, status: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;

