const mongoose = require("mongoose");

const faceDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    descriptor: {
      type: [Number], // Face descriptor as array of numbers
      required: true,
    },
    imageData: {
      type: String, // Base64 encoded image
      required: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    verificationCount: {
      type: Number,
      default: 0,
    },
    failedVerificationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one face data per user
faceDataSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("FaceData", faceDataSchema);

