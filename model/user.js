const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  verified: { type: Boolean, default: false, required: true },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, 8);
    this.password = hash;
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  console.log({ passwordGiven: password, password: this.password });
  const result = await bcrypt.compare(password, this.password);
  console.log({ result });
  return result;
};

module.exports = mongoose.model("User", UserSchema);
