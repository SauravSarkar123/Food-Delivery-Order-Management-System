let orders = new Map();
let orderIdCounter = 1;

const placeOrder = (name, email, address, items) => {
  if (!name || !email || !address || !items || !Array.isArray(items)) {
    throw new Error("Name, email, address, and items are required");
  }

  const order = {
    orderId: orderIdCounter++,
    name,
    email,
    address,
    items,
    status: "Placed",
    deliveryTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
  };
  orders.set(order.orderId, order);
  return order;
};

const getOrdersByEmail = (email) => {
  return Array.from(orders.values()).filter(
    (order) => order.email === email && order.status !== "Cancelled"
  );
};

const getAllOrders = () => {
  return Array.from(orders.values()).filter((order) => order.status !== "Cancelled");
};

const cancelOrder = (email, orderId) => {
  const order = orders.get(parseInt(orderId));
  if (order && order.email === email && order.status !== "Cancelled") {
    order.status = "Cancelled";
    return true;
  }
  return false;
};

const modifyDeliveryAddress = (email, orderId, newAddress) => {
  const order = orders.get(parseInt(orderId));
  if (order && order.email === email && order.status !== "Cancelled") {
    order.address = newAddress;
    return true;
  }
  return false;
};

module.exports = {
  placeOrder,
  getOrdersByEmail,
  getAllOrders,
  cancelOrder,
  modifyDeliveryAddress,
  orders, // Exposed for testing
};