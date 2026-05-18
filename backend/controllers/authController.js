const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

function generateToken(id) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret not configured');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

async function registerUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const fullname = req.body.fullname || req.body.name;
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400);
      return next(new Error('User already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullname: fullname.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { registerUser, loginUser };
