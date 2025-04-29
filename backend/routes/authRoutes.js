const express = require("express");
const router = express.Router();
const { register, loginUser } = require("../controllers/authContoller");
const jwt = require("jsonwebtoken");

// Register route
router.post("/register", register);

// Login route
router.post("/login", loginUser);

module.exports = router;
