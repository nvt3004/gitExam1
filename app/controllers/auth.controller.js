const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    const user = new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    });

    const savedUser = await user.save();

    if (roles && roles.length > 0) {
      const foundRoles = await Role.find({ name: { $in: roles } });

      savedUser.roles = foundRoles.map((role) => role._id);

      await savedUser.save();
    } else {
      const defaultRole = await Role.findOne({ name: "user" });

      savedUser.roles = [defaultRole._id];

      await savedUser.save();
    }

    res.send({ message: "User was registered successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error occurred while signing up." });
  }
};

exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username })
      .populate("roles", "-__v")
      .exec();

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
      expiresIn: 86400, 
    });

    const authorities = user.roles.map((role) => "ROLE_" + role.name.toUpperCase());

    req.session.token = token;

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error occurred while signing in." });
  }
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    res.status(200).send({ message: "You've been signed out!" });
  } catch (error) {
    res.status(500).send({ message: "Error occurred while signing out." });
  }
};
