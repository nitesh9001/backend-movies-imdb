const express = require("express");
const { register, login} = require("../controllers/auth/index");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);

module.exports = router;