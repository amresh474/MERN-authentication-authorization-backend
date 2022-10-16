const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  age: { type: Number, required: true },
  mobile: { type: Number, required: true },
  dob: { type: Date, required: true },
  marital_status: { type: String },
});

module.exports = mongoose.model("userProfile", userProfileSchema);
