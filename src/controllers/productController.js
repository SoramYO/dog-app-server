const Product = require("../models/Product");
const Order = require("../models/Order");
const productController = {
  getProducts: async (req, res) => {
    try {
      const { category, petType, breed, minPrice, maxPrice, rating } =
        req.query;
      const CurrentPage = parseInt(req.query.page) || 1;
      const PageSize = parseInt(req.query.limit) || 10;
      const skip = (CurrentPage - 1) * PageSize;

      let query = {};

      if (category) query.category = category;
      if (petType) query.petType = petType;
      if (breed) query.breedSpecific = breed;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = minPrice;
        if (maxPrice) query.price.$lte = maxPrice;
      }
      if (rating) query.rating = { $gte: rating };

      const products = await Product.find(query)
        .skip(skip)
        .limit(PageSize)
        .sort({ createdAt: -1 });

      const TotalCount = await Product.countDocuments(query);

      res.json({ success: true, products, TotalCount, PageSize, CurrentPage });
    } catch (error) {
      console.error("Error in getProducts:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  createOrder: async (req, res) => {
    try {
      const { items, totalAmount, shippingAddress } = req.body;
      const userId = req.user.id;

      const order = new Order({
        userId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.price,
        })),
        totalAmount,
        shippingAddress,
      });

      await order.save();

      // Update product stock counts
      await Promise.all(
        items.map((item) =>
          Product.findByIdAndUpdate(item.productId, {
            $inc: { stockCount: -item.quantity },
          })
        )
      );

      res.status(201).json({ success: true, order });
    } catch (error) {
      console.error("Error in createOrder:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};

module.exports = productController;
