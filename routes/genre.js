const express = require("express");
const { list, addGenre } = require("../controllers/genre/index");

const router = express.Router();

const  protect  = require("../middleware/auth");

router.get("/", list);
router.post("/", protect, addGenre);

module.exports = router;