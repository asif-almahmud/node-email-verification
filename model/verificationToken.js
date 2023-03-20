const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const VerificationTokenSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

VerificationTokenSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const hash = await bcrypt.hash(this.token, 8);
    this.token = hash;
  }
  next();
});

VerificationTokenSchema.methods.compareToken = async function (token) {
  console.log({ tokenGiven: token, token: this.token });
  const result = await bcrypt.compare(token, this.token);
  console.log({ result });
  return result;
};

module.exports = mongoose.model("VerificationToken", VerificationTokenSchema);
