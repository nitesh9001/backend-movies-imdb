const express = require("express");
const { list, addMovie, editMovie, deleteMovie, search } = require("../controllers/movie/index");

const router = express.Router();

const  protect  = require("../middleware/auth");

router.post("/list", list);
router.post("/", protect, addMovie);
router.post("/search",  search);
router.patch("/:movie_id", protect, editMovie);
router.delete("/:movie_id", protect, deleteMovie);

module.exports = router;