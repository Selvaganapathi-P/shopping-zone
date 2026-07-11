const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  phone:        { type: String, default: "" },
  addressLine1: { type: String, default: "" },
  addressLine2: { type: String, default: "" },
  city:         { type: String, default: "" },
  state:        { type: String, default: "" },
  pincode:      { type: String, default: "" },
  landmark:     { type: String, default: "" },
  isAdmin:      { type: Boolean, default: false },
  isSuspended:  { type: Boolean, default: false },
}, { timestamps: true });

// Remove pre save hook completely
// Hash password in controller instead

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compareSync(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);