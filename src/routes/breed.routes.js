const express = require("express");

const breedController = require("../controllers/breedController");

const router = express.Router();

router.get("/all", breedController.getAllBreeds);

router.get("/:id", breedController.getBreed);

router.get("/categories", breedController.getBreedsByCategory);

module.exports = router;
