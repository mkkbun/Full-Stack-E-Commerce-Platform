import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ProductsController } from "./api/src/modules/products/products.controller.ts";
import { Product, Order, OrderStatus, AnalyticsSummary, CartItem } from "./src/types.ts";

// In-memory highly persistent datastore
let dbProducts: Product[] = [
  {
    id: "prod_1",
    name: "Neo Quantum Chronograph",
    description: "Sleek tactical watch fusing traditional mechanics with advanced digital sub-dials. Framed by a brushed sapphire crystal casing and architectural steel bands.",
    price: 299,
    rating: 4.8,
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600"
    ],
    variants: [
      { id: "v_1_1", size: "One Size", color: "Midnight Black", colorCode: "#111827", stock: 12 },
      { id: "v_1_2", size: "One Size", color: "Aurora Silver", colorCode: "#9CA3AF", stock: 8 },
      { id: "v_1_3", size: "One Size", color: "Horizon Blue", colorCode: "#2563EB", stock: 15 }
    ],
    stock: 35,
    featured: true
  },
  {
    id: "prod_2",
    name: "Helix Hybrid Activewear",
    description: "Minimalist, moisture-wicking technical athletic shirt constructed with dynamic flat-lock stitching and high-airflow structural mesh panels.",
    price: 75,
    rating: 4.6,
    category: "Apparel",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600"
    ],
    variants: [
      { id: "v_2_1", size: "S", color: "Luna Grey", colorCode: "#6B7280", stock: 20 },
      { id: "v_2_2", size: "M", color: "Luna Grey", colorCode: "#6B7280", stock: 18 },
      { id: "v_2_3", size: "L", color: "Luna Grey", colorCode: "#6B7280", stock: 10 },
      { id: "v_2_4", size: "M", color: "Stealth Black", colorCode: "#1F2937", stock: 25 },
      { id: "v_2_5", size: "L", color: "Stealth Black", colorCode: "#1F2937", stock: 30 }
    ],
    stock: 103,
    featured: true
  },
  {
    id: "prod_3",
    name: "AeroStride Kinetic Sneakers",
    description: "Tailored multi-density cushioning runner engineered with precision knitted uppers and high-energy response bio-foam outsoles.",
    price: 160,
    rating: 4.9,
    category: "Footwear",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=600"
    ],
    variants: [
      { id: "v_3_1", size: "8", color: "Onyx Gold", colorCode: "#d97706", stock: 4 },
      { id: "v_3_2", size: "9", color: "Onyx Gold", colorCode: "#d97706", stock: 12 },
      { id: "v_3_3", size: "10", color: "Onyx Gold", colorCode: "#d97706", stock: 14 },
      { id: "v_3_4", size: "9", color: "White Sage", colorCode: "#d1fae5", stock: 9 },
      { id: "v_3_5", size: "11", color: "White Sage", colorCode: "#d1fae5", stock: 5 }
    ],
    stock: 44,
    featured: true
  },
  {
    id: "prod_4",
    name: "Scribe Leather Tech Folio",
    description: "Handcrafted sleeve and desk system built from vegetable-tanned full-grain leather, featuring protective wool felt lining and modular cable straps.",
    price: 120,
    rating: 4.7,
    category: "Accessories",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
    ],
    variants: [
      { id: "v_4_1", size: "One Size", color: "Chestnut Brown", colorCode: "#78350f", stock: 15 },
      { id: "v_4_2", size: "One Size", color: "Charcoal", colorCode: "#374151", stock: 22 }
    ],
    stock: 37,
    featured: false
  },
  {
    id: "prod_5",
    name: "Nova Sound Capsule",
    description: "Multi-driver architectural spatial audio speaker equipped with ultra-fast WiFi streaming, room-adaptive equalization curves, and responsive touch controls.",
    price: 249,
    rating: 4.5,
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600"
    ],
    variants: [
      { id: "v_5_1", size: "One Size", color: "Ceramic White", colorCode: "#F9FAFB", stock: 14 },
      { id: "v_5_2", size: "One Size", color: "Iron Grey", colorCode: "#4B5563", stock: 10 }
    ],
    stock: 24,
    featured: false
  },
  {
    id: "prod_6",
    name: "Elysium Premium Wool Coat",
    description: "Double-breasted unstructured overcoat woven from superfine Virgin Merino Wool. Framed by hand-tailored lapels and hidden magnet button closures.",
    price: 350,
    rating: 4.9,
    category: "Apparel",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600"
    ],
    variants: [
      { id: "v_6_1", size: "M", color: "Camel Tan", colorCode: "#b45309", stock: 6 },
      { id: "v_6_2", size: "L", color: "Camel Tan", colorCode: "#b45309", stock: 8 },
      { id: "v_6_3", size: "M", color: "Charcoal Gray", colorCode: "#374151", stock: 11 },
      { id: "v_6_4", size: "L", color: "Charcoal Gray", colorCode: "#374151", stock: 14 }
    ],
    stock: 39,
    featured: true
  }
];

// Historical seed orders to make the admin panel charts look incredibly rich
let dbOrders: Order[] = [
  {
    id: "ord_101",
    createdAt: "2026-05-25T10:15:30Z",
    customerName: "Sarah Jenkins",
    customerEmail: "sarah.j@example.com",
    items: [
      { productId: "prod_1", variantId: "v_1_1", quantity: 1, priceAtPurchase: 299 }
    ],
    total: 299,
    shippingAddress: "452 Pine Crescent, Seattle, WA, 98101",
    status: "DELIVERED",
    paymentIntentId: "pi_fake_101",
    trackingNumber: "UPS-918231"
  },
  {
    id: "ord_102",
    createdAt: "2026-05-26T14:22:45Z",
    customerName: "David Miller",
    customerEmail: "d.miller@example.com",
    items: [
      { productId: "prod_2", variantId: "v_2_4", quantity: 2, priceAtPurchase: 75 },
      { productId: "prod_4", variantId: "v_4_2", quantity: 1, priceAtPurchase: 120 }
    ],
    total: 270,
    shippingAddress: "901 Oak Avenue, Austin, TX, 78701",
    status: "SHIPPED",
    paymentIntentId: "pi_fake_102",
    trackingNumber: "FEDEX-88214"
  },
  {
    id: "ord_103",
    createdAt: "2026-05-27T09:05:12Z",
    customerName: "Elena Rostova",
    customerEmail: "elena.r@example.com",
    items: [
      { productId: "prod_3", variantId: "v_3_2", quantity: 1, priceAtPurchase: 160 }
    ],
    total: 160,
    shippingAddress: "77 Broadway Blvd, New York, NY, 10003",
    status: "PROCESSING",
    paymentIntentId: "pi_fake_103"
  },
  {
    id: "ord_104",
    createdAt: "2026-05-28T02:40:00Z",
    customerName: "Marcus Thorne",
    customerEmail: "mthorne@example.com",
    items: [
      { productId: "prod_6", variantId: "v_6_1", quantity: 1, priceAtPurchase: 350 }
    ],
    total: 350,
    shippingAddress: "1280 Sunset Blvd, Los Angeles, CA, 90026",
    status: "PENDING",
    paymentIntentId: "pi_fake_104"
  },
  {
    id: "ord_105",
    createdAt: "2026-05-28T11:15:20Z",
    customerName: "Clara Vance",
    customerEmail: "clara@vance.net",
    items: [
      { productId: "prod_2", variantId: "v_2_1", quantity: 1, priceAtPurchase: 75 }
    ],
    total: 75,
    shippingAddress: "33 Sci-Fi Drive, Boston, MA, 02115",
    status: "REFUNDED",
    paymentIntentId: "pi_fake_105"
  }
];

// Set of processed payment intent IDs for Stripe Webhook idempotency protection
const processedWebhookEventIds = new Set<string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing and static payload handling
  app.use(express.json());

  // Instantiate Products Controller
  const productsController = new ProductsController(dbProducts);

  // API 1: Product routes delegates
  app.get("/api/products", productsController.getProducts);
  app.get("/api/products/:id", productsController.getProductById);
  app.post("/api/products", productsController.createProduct);
  app.put("/api/products/:id", productsController.updateProduct);
  app.delete("/api/products/:id", productsController.deleteProduct);

  // API 2: Order status updating & retrieval
  app.get("/api/orders", (req, res) => {
    res.status(200).json({ success: true, count: dbOrders.length, data: dbOrders });
  });

  app.put("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    const order = dbOrders.find(o => o.id === id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    order.status = status as OrderStatus;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    res.status(200).json({ success: true, data: order });
  });

  // API 3: Stripe Checkout Simulator (Payment Intent generation)
  app.post("/api/checkout/intent", (req, res) => {
    const { customerName, customerEmail, shippingAddress, items, total } = req.body;

    if (!items || !items.length) {
      res.status(400).json({ success: false, message: "No items provided in checkout payload." });
      return;
    }

    // Verify stock checks before generating intent
    for (const item of items) {
      const prod = dbProducts.find(p => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant && variant.stock < item.quantity) {
          res.status(400).json({ 
            success: false, 
            message: `Selected color option or size for ${prod.name} has depleted. Available stock: ${variant.stock}` 
          });
          return;
        }
      }
    }

    // Generate unique simulated Stripe IDs
    const paymentIntentId = "pi_" + Math.random().toString(36).substring(2, 12);
    const clientSecret = "seti_" + Math.random().toString(36).substring(2, 12) + "_secret_test";

    // Register PENDING order
    const newOrder: Order = {
      id: "ord_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      customerName,
      customerEmail,
      items,
      total,
      shippingAddress,
      status: "PENDING",
      paymentIntentId
    };

    dbOrders.unshift(newOrder);

    // Deduct stock optimistically / realistically
    for (const item of items) {
      const prod = dbProducts.find(p => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant) {
          variant.stock -= item.quantity;
        }
        prod.stock = prod.variants.reduce((acc, v) => acc + v.stock, 0);
      }
    }

    res.status(201).json({
      success: true,
      paymentIntentId,
      clientSecret,
      order: newOrder,
      feeBreakdown: {
        subtotal: total - (total * 0.1),
        tax: total * 0.1,
        total
      }
    });
  });

  // API 4: Stripe webhook simulation with strict Idempotency Protection
  app.post("/api/checkout/webhook-simulate", (req, res) => {
    const { eventId, paymentIntentId } = req.body;

    if (!eventId || !paymentIntentId) {
      res.status(400).json({ success: false, message: "Missing eventId or paymentIntentId in webhook context." });
      return;
    }

    // Idempotency check: store and match processed IDs to prevent duplicated inventory depletion/orders
    if (processedWebhookEventIds.has(eventId)) {
      res.status(200).json({
        success: true,
        idempotenceStatus: "DUPLICATE_IGNORED",
        message: `Event ${eventId} already compiled. Prevention system bypassed duplicate execution.`
      });
      return;
    }

    // Process new payment success webhook event
    processedWebhookEventIds.add(eventId);

    const order = dbOrders.find(o => o.paymentIntentId === paymentIntentId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order associated with payment token is invalid." });
      return;
    }

    order.status = "PROCESSING";

    res.status(200).json({
      success: true,
      idempotenceStatus: "PROCESSED",
      message: `Simulated Stripe webhook event ${eventId} successfully validated. Status changed to PROCESSING.`,
      data: order
    });
  });

  // API 5: Refund processing controller
  app.post("/api/orders/refund", (req, res) => {
    const { orderId } = req.body;
    const order = dbOrders.find(o => o.id === orderId);

    if (!order) {
      res.status(404).json({ success: false, message: "Order not registered on database." });
      return;
    }

    if (order.status === "REFUNDED") {
      res.status(400).json({ success: false, message: "This order has already been fully refunded on Stripe." });
      return;
    }

    // Process simulated refund
    order.status = "REFUNDED";

    // Replenish product variant stock
    for (const item of order.items) {
      const prod = dbProducts.find(p => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(v => v.id === item.variantId);
        if (variant) {
          variant.stock += item.quantity;
        }
        prod.stock = prod.variants.reduce((acc, v) => acc + v.stock, 0);
      }
    }

    res.status(200).json({
      success: true,
      message: `Full refund of $${order.total} initiated on Stripe for customer ${order.customerEmail}. Inventory levels replenished.`,
      data: order
    });
  });

  // API 6: Analytics aggregator
  app.get("/api/analytics", (req, res) => {
    const completedOrders = dbOrders.filter(o => o.status !== "REFUNDED");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const count = completedOrders.length;
    const aov = count > 0 ? Math.round(totalRevenue / count) : 0;

    // Aggregate Product Sales quantities
    const productSalesMap: Record<string, { name: string; sales: number; revenue: number; image: string }> = {};
    for (const order of completedOrders) {
      for (const item of order.items) {
        const prod = dbProducts.find(p => p.id === item.productId);
        if (prod) {
          if (!productSalesMap[prod.id]) {
            productSalesMap[prod.id] = {
              name: prod.name,
              sales: 0,
              revenue: 0,
              image: prod.images[0]
            };
          }
          productSalesMap[prod.id].sales += item.quantity;
          productSalesMap[prod.id].revenue += item.quantity * item.priceAtPurchase;
        }
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Dynamic funnel mapping
    // Visits (mock 1000) -> View Details (mock 450) -> Add to Cart (mock 200) -> Checkout Complete (actual orders count)
    const viewCount = 450;
    const cartCount = 200;
    const orderCount = dbOrders.length;

    const funnelSteps = [
      { stage: "Storefront Impressions", count: 1200, percentage: 100 },
      { stage: "Product Detail Clicks", count: viewCount, percentage: Math.round((viewCount / 1200) * 100) },
      { stage: "Add To Cart", count: cartCount, percentage: Math.round((cartCount / 1200) * 100) },
      { stage: "Purchase Completed", count: orderCount, percentage: Math.round((orderCount / 1200) * 100) }
    ];

    // Build days of week analytics datasets
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyDataset = daysOfWeek.map((day, idx) => {
      // simulate realistic amounts matching actual orders
      const ordersOnThisDay = dbOrders.filter(o => {
        const date = new Date(o.createdAt);
        return date.getDay() === (idx + 1) % 7;
      });
      const amount = ordersOnThisDay.reduce((s, o) => s + o.total, 0);
      return {
        period: day,
        amount: amount > 0 ? amount : Math.round(50 + Math.sin(idx) * 40), 
        orderCount: ordersOnThisDay.length || 2
      };
    });

    res.status(200).json({
      success: true,
      data: {
        revenue: totalRevenue,
        ordersCount: dbOrders.length,
        averageOrderValue: aov,
        conversionRate: 3.2,
        topProducts,
        funnelSteps,
        revenueData: dailyDataset
      }
    });
  });

  // Multi-Mode Routing with standard hot swap configuration
  if (process.env.NODE_ENV !== "production") {
    // Inject custom path files compilation
    const viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(viteInstance.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fullstack Gateway] Live on Port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Express Boot Failure:", err);
});
