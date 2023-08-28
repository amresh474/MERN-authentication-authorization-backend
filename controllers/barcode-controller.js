const User = require("../models/user.model");
const {createCanvas} = require("canvas")
const BarCode = require("jsbarcode")
const UserProfile = require("../models/userProfile.model");

// createBarcode

const createBarcode = async (req, res, next) => {
  const userId = {tex:"abcd",
number:123};
  let user;
  try {
    // user = await User.findById(userId, "-password");
    // if (!user) {
    //   return res.status(404).json({ messsage: "User Not FOund" });
    // }
const canvas = createCanvas();
let toString = obj => Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
BarCode(canvas,toString(userId),{
    format :'CODE128',
    displayValue: true,
    fontSize:18,
    textMargin:10,
    // format: "pharmacode",
    lineColor: "#0aa",
    width:1,
    height:40,
});
res.type('image/png');
const stream = canvas.createPNGStream();
stream.pipe(res);
    // return res.status(200).type('image/png').stream.pipe(res);
  } catch (err) {
    return res.status(200).json(err);
  }
};

module.exports = {
    createBarcode
  };