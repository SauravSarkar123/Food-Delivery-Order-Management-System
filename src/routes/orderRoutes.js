const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

// Place a new food order
router.post("/place-order", orderController.placeOrder);

// View order details by email
router.get("/order-details/:email", orderController.viewOrderDetails);

// View all active orders
router.get("/all-orders", orderController.viewAllOrders);

// Cancel an order
router.delete("/cancel-order/:email/:orderId", orderController.cancelOrder);

// Modify delivery address
router.put("/modify-address/:email/:orderId", orderController.modifyDeliveryAddress);

module.exports = router;