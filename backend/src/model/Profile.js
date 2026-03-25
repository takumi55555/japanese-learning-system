const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["男性", "女性"],
      default: "男性",
    },
    birthday: {
      type: Date,
      default: null,
    },
    // 👇 NEW: Face descriptor stored as array of numbers
    faceDescriptor: {
      type: [Number], // an array of numbers from face-api.js
      default: [],
    },
    favorites: {
      type: [String],
      default: [],
      index: true,
    },
    group_id: {
      type: String,
      default: "",
      trim: true,
    },
    student_id: {
      type: String,
      default: undefined, // Use undefined instead of null to exclude from sparse index
      trim: true,
      unique: true,
      sparse: true,
      index: true,
      set: function(value) {
        // Convert empty string or null to undefined for sparse index to work correctly
        // undefined values are excluded from sparse indexes, allowing multiple undefined values
        return value === "" || value === null || value === undefined ? undefined : value;
      },
    },
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    postalCode: {
      type: String,
      default: "",
      trim: true,
    },
    prefecture: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    addressOther: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "profiles",
  }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
