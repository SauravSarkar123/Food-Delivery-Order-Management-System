const request = require("supertest");
const app = require("../src/app");
const orderService = require("../src/services/orderService");

describe("Order Controller", () => {
  beforeEach(() => {
    // Reset orders and orderIdCounter before each test
    orderService.orders.clear();
    orderService.orderIdCounter = 1;
  });

  test("Place a new order", async () => {
    const response = await request(app)
      .post("/api/orders/place-order")
      .send({
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        items: [
          {
            itemId: "PROD-001",
            name: "Pizza",
            quantity: 2,
            price: 12.99,
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      orderId: 1,
      status: "Placed",
      items: expect.arrayContaining([
        expect.objectContaining({
          itemId: "PROD-001",
          name: "Pizza",
        }),
      ]),
    });
  });

  test("Place order with invalid items", async () => {
    const response = await request(app)
      .post("/api/orders/place-order")
      .send({
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        items: [
          {
            name: "Burger", // Missing itemId, quantity, price
          },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Invalid item structure");
  });

  test("View order details", async () => {
    await orderService.placeOrder(
      "John Doe",
      "john@example.com",
      "123 Main St",
      [
        {
          itemId: "PROD-001",
          name: "Pizza",
          quantity: 1,
          price: 12.99,
        },
      ]
    );

    const response = await request(app).get(
      "/api/orders/order-details/john@example.com"
    );

    expect(response.status).toBe(200);
    expect(response.body[0].items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: "PROD-001",
          price: 12.99,
        }),
      ])
    );
  });

  test("View order details - no orders found", async () => {
    const response = await request(app).get(
      "/api/orders/order-details/nonexistent@example.com"
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No orders found for this email");
  });

  test("Cancel an order", async () => {
    const order = await orderService.placeOrder(
      "John Doe",
      "john@example.com",
      "123 Main St",
      [
        {
          itemId: "PROD-001",
          name: "Pizza",
          quantity: 1,
          price: 12.99,
        },
      ]
    );

    const response = await request(app).delete(
      `/api/orders/cancel-order/john@example.com/${order.orderId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Order cancelled successfully");
  });

  test("Cancel an order - order not found", async () => {
    const response = await request(app).delete(
      "/api/orders/cancel-order/john@example.com/999"
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Order not found or already cancelled");
  });

  test("Modify delivery address - success", async () => {
    const order = await orderService.placeOrder(
      "John Doe",
      "john@example.com",
      "123 Main St",
      [
        {
          itemId: "PROD-001",
          name: "Pizza",
          quantity: 1,
          price: 12.99,
        },
      ]
    );

    const response = await request(app)
      .put(`/api/orders/modify-address/john@example.com/${order.orderId}`)
      .send({ newAddress: "456 New St" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Delivery address updated successfully");
  });

  test("Modify delivery address - order not found", async () => {
    const response = await request(app)
      .put("/api/orders/modify-address/john@example.com/999")
      .send({ newAddress: "456 New St" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Order not found ");
  });

  test("Get all orders - only active orders", async () => {
    // Place two orders
    await orderService.placeOrder("John Doe", "john@example.com", "123 Main St", [
      {
        itemId: "PROD-001",
        name: "Pizza",
        quantity: 1,
        price: 12.99,
      },
    ]);
    await orderService.placeOrder("Jane Doe", "jane@example.com", "456 Main St", [
      {
        itemId: "PROD-002",
        name: "Burger",
        quantity: 1,
        price: 9.99,
      },
    ]);

    // Cancel John's order
    const johnsOrder = Array.from(orderService.orders.values()).find(
      (order) => order.email === "john@example.com"
    );
    await orderService.cancelOrder("john@example.com", johnsOrder.orderId);

    // Fetch all active orders
    const response = await request(app).get("/api/orders/all-orders");

    // Verify response
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1); // Only Jane's order should be active
    expect(response.body[0].email).toBe("jane@example.com");
  });
});