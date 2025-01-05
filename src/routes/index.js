const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const dogRoutes = require("./dog.routes");
const socialRoutes = require("./social.routes");
const petRoutes = require("./pet.routes");
const productRoutes = require("./product.routes");

router.use("/auth", authRoutes);
router.use("/dog", dogRoutes);
router.use("/social", socialRoutes);
router.use("/pet", petRoutes);
router.use("/product", productRoutes);

module.exports = router;
