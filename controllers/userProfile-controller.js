const User = require("../models/user.model");
const UserProfile = require("../models/userProfile.model");

// getUser
const getUser = async (req, res, next) => {
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password");
    if (!user) {
      return res.status(404).json({ messsage: "User Not FOund" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(200).json(err);
  }
};

// create new user profile
const userProfile = async (req, res, next) => {
  const { user, age, mobile, dob, marital_status } = req.body;
  try {
    const userProfile = new UserProfile({
      user,
      age,
      mobile,
      dob,
      marital_status,
    });
    await userProfile.save();
    res.status(201).json({ message: userProfile });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// get user profile detail
const getUserProfile = async (req, res, next) => {
  try {
    let userProfile = await UserProfile.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
    ]);
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
module.exports = {
  getUser,
  userProfile,
  getUserProfile,
};
