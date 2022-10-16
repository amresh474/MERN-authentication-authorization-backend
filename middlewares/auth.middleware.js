const jwt = require("jsonwebtoken");
const tokenGenerate = require("../utils/jwtToken");
const verifyToken = (req, res, next) => {
  const cookies = req.headers.cookie;
  const token = cookies.split("=")[1];
  if (!token) {
    res.status(404).json({ message: "No token found" });
  }
  jwt.verify(String(token), process.env.JWT_ACCESS_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(400).json({ message: "Invalid TOken" });
    }

    console.log(user.id);
    req.id = user.id;
  });
  next();
};

const verifyRefreshToken = (req, res, next) => {
  const prevToken = req.headers.authorization;
  //   const prevToken = req.headers.authorization.split(' ')[1];
  if (!prevToken) {
    return res.status(400).json({ message: "Couldn't find token" });
  }

  jwt.verify(String(prevToken), process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    const token = tokenGenerate.tokenGenerate(
      user.id,
      process.env.JWT_ACCESS_SECRET_KEY,
      process.env.JWT_ACCESS_TIME
    );
    console.log("Regenerated Token\n", token);

    res.cookie(String(user.id), token, {
      path: "/",
      expires: new Date(Date.now() + 1000 * 30), // 30 seconds
      httpOnly: true,
      sameSite: "lax",
    });

    req.id = user.id;
    next();
  });
};

module.exports = {
  verifyToken,
  verifyRefreshToken,
};
