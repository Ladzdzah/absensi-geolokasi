const express = require("express");
const router = express.Router();
const { register, loginUser, resetPassword } = require("../controllers/authController");

// Register route
router.post("/register", register);

// Login route
router.post("/login", loginUser);

// Reset password route
router.post("/reset-password", resetPassword);



module.exports = router;module.exports = router;
