const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const breedRoutes = require("./breed.routes");
const socialRoutes = require("./social.routes");
const petRoutes = require("./pet.routes");
const productRoutes = require("./product.routes");
const adminRoutes = require("./admin.routes");

router.use("/auth", authRoutes);
router.use("/breed", breedRoutes);
router.use("/social", socialRoutes);
router.use("/pet", petRoutes);
router.use("/product", productRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
