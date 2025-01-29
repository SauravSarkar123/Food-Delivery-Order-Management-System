const orderService = require("../src/services/orderService");

describe("Order Service", () => {
  const mockItems = [
    {
      itemId: "PROD-001",
      name: "Pizza",
      quantity: 1,
      price: 12.99
    }
  ];

  beforeEach(() => {
    orderService.orders.clear();
    orderService.orderIdCounter = 1;
  });

  test("Place a new order with valid items", () => {
    const order = orderService.placeOrder(
      "John Doe", 
      "john@example.com", 
      "123 Main St", 
      mockItems
    );
    
    expect(order).toMatchObject({
      orderId: 1,
      items: mockItems,
      status: "Placed"
    });
  });

  test("Place order with invalid items throws error", () => {
    expect(() => {
      orderService.placeOrder(
        "John Doe",
        "john@example.com",
        "123 Main St",
        [{ name: "Burger" }] // Invalid item
      );
    }).toThrow("Invalid item structure");
  });

  test("Cancel an order maintains items", () => {
    const order = orderService.placeOrder(
      "John Doe", 
      "john@example.com", 
      "123 Main St", 
      mockItems
    );
    
    orderService.cancelOrder("john@example.com", order.orderId);
    const cancelledOrder = orderService.orders.get(order.orderId);
    
    expect(cancelledOrder.status).toBe("Cancelled");
    expect(cancelledOrder.items).toEqual(mockItems);
  });

  test("Cancel an order", () => {
    const order = orderService.placeOrder("John Doe", "john@example.com", "123 Main St", ["Pizza"]);
    const success = orderService.cancelOrder("john@example.com", order.orderId);
    expect(success).toBe(true);
    expect(orderService.orders.get(order.orderId).status).toBe("Cancelled");
  });

  test("Modify delivery address - success", () => {
    const order = orderService.placeOrder("John Doe", "john@example.com", "123 Main St", ["Pizza"]);
    const success = orderService.modifyDeliveryAddress("john@example.com", order.orderId, "456 New St");
    expect(success).toBe(true);
    expect(orderService.orders.get(order.orderId).address).toBe("456 New St");
  });

  test("Modify delivery address - order not found", () => {
    const success = orderService.modifyDeliveryAddress("john@example.com", 999, "456 New St");
    expect(success).toBe(false);
  });

  test("Get all orders - only active orders", () => {
    // Place two orders
    orderService.placeOrder("John Doe", "john@example.com", "123 Main St", ["Pizza"]);
    orderService.placeOrder("Jane Doe", "jane@example.com", "456 Main St", ["Burger"]);

    // Cancel John's order
    const johnsOrder = Array.from(orderService.orders.values()).find(
      (order) => order.email === "john@example.com"
    );
    orderService.cancelOrder("john@example.com", johnsOrder.orderId);

    // Fetch all active orders
    const activeOrders = orderService.getAllOrders();

    // Verify response
    expect(activeOrders.length).toBe(1); // Only Jane's order should be active
    expect(activeOrders[0].email).toBe("jane@example.com");
  });
});