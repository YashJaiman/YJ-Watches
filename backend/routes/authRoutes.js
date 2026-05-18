const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

const signupValidators = [
  body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number.'),
];

const registerValidators = [
  body('fullname').trim().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters.'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number.'),
];

router.post('/register', registerValidators, registerUser);
router.post('/signup', signupValidators, registerUser);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  loginUser
);

module.exports = router;
