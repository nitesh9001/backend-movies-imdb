const express = require("express");
const { register, login, addWtachlater, getWtachlater} = require("../controllers/auth/index");

const router = express.Router();

const  protect  = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/watchlater", protect, addWtachlater);
router.get("/watchlater", protect, getWtachlater);

module.exports = router;