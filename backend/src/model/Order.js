const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    group_admin_id: {
      type: String,
      required: true,
      index: true,
    },
    purchase_date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    course_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    payment_id: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

// Compound indexes only (single-field indexes already defined via index: true in schema)
orderSchema.index({ group_admin_id: 1, purchase_date: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

