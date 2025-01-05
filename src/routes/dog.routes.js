const express = require("express");

const dogController = require("../controllers/dogController");

const router = express.Router();

router.get("/all", dogController.getAllDogs);

router.post("/:id", dogController.getDog);

router.get("/categories", dogController.getDogsByCategory);

module.exports = router;
