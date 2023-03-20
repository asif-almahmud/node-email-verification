// ~ user model
const User = require("../model/user");
const VerificationToken = require("../model/verificationToken");
const { sendError } = require("../utils/helper");

const jwt = require("jsonwebtoken");
const { generateOTP, mailTransport } = require("../utils/mail");
const { isValidObjectId } = require("mongoose");

// # create a user
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  //-> check if email is used before for registration
  const user = await User.findOne({ email });
  if (user) return sendError(res, "Email already used!");

  // ~ create new user
  const newUser = new User({ name, email, password });

  const OTP = generateOTP();
  const verificationToken = new VerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  // TODO - Rather than OTP we can also send a link (like - http://localhost:4000/api/user/verify-email/{userId}). If the user clicks the link we will then be able to verify him using his userId.

  await verificationToken.save();
  await newUser.save();

  mailTransport().sendMail({
    from: "emailverification@email.com",
    to: newUser.email,
    subject: "Verify your email account",
    html: `<h1>${OTP}</h1>`,
  });

  res.send(newUser);
};

// ~ signin a user
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email.trim() || !password.trim()) {
    return sendError(res, "Email or Password missing");
  }

  const user = await User.findOne({ email });

  if (!user) return sendError(res, "User not found!");

  const passwordMatched = await user.comparePassword(password);

  if (!passwordMatched)
    return sendError(res, "Email or Password does not match!");

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({
    success: true,
    user: { name: user.name, email: user.email, id: user._id, token },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp.trim())
    return sendError(res, "Invalid request, missing parameters");

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user id!");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "Sorry, user not found");

  if (user.verified) return sendError(res, "This account is already verified");

  const token = await VerificationToken.findOne({ owner: user._id });
  if (!token) return sendError(res, "Sorry, user not found!");

  const isMatched = await token.compareToken(otp);
  if (!isMatched) return sendError(res, "Please provide a valid token!");

  user.verified = true;

  await VerificationToken.findByIdAndDelete(token._id);
  await user.save();

  mailTransport().sendMail({
    from: "emailverification@email.com",
    to: user.email,
    subject: "Welcome Email",
    html: `<h1>Email verification successful</h1>`,
  });

  res.json({
    success: true,
    message: "Email verification successful",
    user: { name: user.name, email: user.email, id: user._id },
  });
};
