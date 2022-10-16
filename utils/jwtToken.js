const jwt = require("jsonwebtoken");

const tokenGenerate = (Id, SECRET_KEY, TIME) => {
  const token = jwt.sign({ id: Id }, SECRET_KEY, { expiresIn: TIME });
  return token;
};

module.exports = {
  tokenGenerate
};
