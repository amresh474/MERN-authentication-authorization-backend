const User = require("../models/user.model");
const TokenModel = require("../models/emailverificationToken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const tokenGenerate = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

// for user registration
const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    let existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists! Login Instead" });
    }
    // here password hasing

    const hashedPassword = bcrypt.hashSync(password);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = await new TokenModel({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    const url = `${process.env.BASE_URL}/v1/auth/${user.id}/verify/${token.token}`;
    await sendEmail(user.email, "Verify Email", url);

    res
      .status(201)
      .send({ message: "An Email sent to your account please verify" });
  } catch (err) {
    res.status(201).json({ message: err });
  }
};

// user Login
const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ error: "fill all the details" });
  }
  try {
    let existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found. Signup Please" });
    }
    const isPasswordCorrect = bcrypt.compareSync(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Inavlid Email / Password" });
    }
    if (!existingUser.verified) {
      let tokenUrl = await TokenModel.findOne({ userId: existingUser._id });
      if (!tokenUrl) {
        tokenUrl = await new TokenModel({
          userId: existingUser._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const url = `${process.env.BASE_URL}/v1/auth/${existingUser.id}/verify/${tokenUrl.token}`;
        await sendEmail(existingUser.email, "Verify Email", url);
      }

      return res
        .status(400)
        .send({ message: "An Email sent to your account please verify" });
    }
    // token generate
    const token = tokenGenerate.tokenGenerate(
      existingUser._id,
      process.env.JWT_ACCESS_SECRET_KEY,
      process.env.JWT_ACCESS_TIME
    );

    const refresh_token = GenerateRefreshToken(existingUser._id);

    if (req.cookies[`${existingUser._id}`]) {
      req.cookies[`${existingUser._id}`] = "";
    }
    // cookiegenerate
    res.cookie(String(existingUser._id), token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 30), // 30 seconds
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Successfully Logged In",
      user: existingUser,
      refresh_token,
    });
  } catch (err) {
    res.status(201).json({ message: err });
  }
};

function GenerateRefreshToken(user_id) {
  const refresh_token = tokenGenerate.tokenGenerate(
    user_id,
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_TIME
  );

  return refresh_token;
}
// verify Email
const emailVerify = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await TokenModel.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    await User.updateOne({ _id: user._id }, { $set: { verified: true } });
    await TokenModel.remove();

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// send email Link For reset Password
const sendPasswordlink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }
  try {
    let user = await User.findOne({ email });
    if (!user)
      return res
        .status(409)
        .send({ message: "User with given email does not exist!" });

    let token = await TokenModel.findOne({ userId: user._id });
    if (!token) {
      token = await new TokenModel({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const url = `${process.env.BASE_URL}/v1/auth/password-reset/${user._id}/${token.token}/`;
    await sendEmail(user.email, "Password Reset", url);

    res
      .status(200)
      .send({ message: "Password reset link sent to your email account" });
  } catch (error) {
    res.status(401).json({ status: 401, message: error });
  }
};

// verify password reset link
const verifyPassord = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await TokenModel.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    res.status(200).send("Valid Url");
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//  set new password
const setNewPassword = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(401).json({ status: 401, message: "Enter Your password" });
  }
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await TokenModel.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    if (!user.verified) user.verified = true;

    const hashedPassword = bcrypt.hashSync(password);

    user.password = hashedPassword;
    await user.save();
    await token.remove();

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  login,
  emailVerify,
  sendPasswordlink,
  verifyPassord,
  setNewPassword,
};
