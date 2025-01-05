const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/authenticate");
const petController = require("../controllers/petController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Pet Routes
router.post("/scan", upload.single("image"), petController.scanPet);
router.post("/pets", auth.verifyAccessToken, petController.createPetProfile);
router.get("/pets/:id", auth.verifyAccessToken, petController.getPetProfile);

module.exports = router;
