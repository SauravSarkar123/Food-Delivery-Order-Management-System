const orderService = require("../services/orderService");

const placeOrder = (req, res) => {
  const { name, email, address, items } = req.body;

  if (!name || !email || !address || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: "Name, email, address, and items are required" });
  }

  if (!items.every(item => 
    typeof item === 'object' &&
    item.itemId !== undefined &&
    item.name !== undefined &&
    item.quantity !== undefined &&
    item.price !== undefined
  )) {
    return res.status(400).json({ 
      message: "Invalid item structure. Each item must contain itemId, name, quantity, and price" 
    });
  }

  try {
    const order = orderService.placeOrder(name, email, address, items);
    res.status(201).json(order);
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(400).json({ message: error.message });
  }
};

const viewOrderDetails = (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const orders = orderService.getOrdersByEmail(email);
  if (orders.length === 0) {
    return res.status(404).json({ message: "No orders found for this email" });
  }
  res.status(200).json(orders);
};

const viewAllOrders = (req, res) => {
  const orders = orderService.getAllOrders();
  if (orders.length === 0) {
    return res.status(404).json({ message: "No orders found" });
  }
  res.status(200).json(orders);
};

const cancelOrder = (req, res) => {
  const { email, orderId } = req.params;
  const success = orderService.cancelOrder(email, orderId);
  if (success) {
    res.status(200).json({ message: "Order cancelled successfully" });
  } else {
    res.status(404).json({ message: "Order not found or already cancelled" });
  }
};

const modifyDeliveryAddress = (req, res) => {
  const { email, orderId } = req.params;
  const { newAddress } = req.body;
  if (!newAddress) {
    return res.status(400).json({ message: "New address is required" });
  }

  const success = orderService.modifyDeliveryAddress(email, orderId, newAddress);
  if (success) {
    res.status(200).json({ message: "Delivery address updated successfully" });
  } else {
    res.status(404).json({ message: "Order not found or already cancelled" });
  }
};

module.exports = {
  placeOrder,
  viewOrderDetails,
  viewAllOrders,
  cancelOrder,
  modifyDeliveryAddress,
};