const express = require("express");
const cors = require("cors");
const connectDB = require("./config/mongoDB");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes/index");
require("dotenv").config();
const createError = require("http-errors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api", routes);

app.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

app.use(errorHandler);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
