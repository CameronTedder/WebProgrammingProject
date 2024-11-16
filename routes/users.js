const express = require('express');
const router = express.Router();
const db = require('../db');
const userController = require("../controllers/userController");

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);


module.exports = router;