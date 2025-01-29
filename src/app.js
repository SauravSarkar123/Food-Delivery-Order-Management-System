require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./logger");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

// Routes
app.use("/api/orders", orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message}`);
  res.status(500).json({ message: "Something went wrong!" });
});

module.exports = app; // Export the app object for testing