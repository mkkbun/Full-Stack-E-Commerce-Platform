/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Header from "./components/Header";
import StorefrontCatalogue from "./components/StorefrontCatalogue";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutPanel from "./components/CheckoutPanel";
import DashboardAnalytics from "./components/DashboardAnalytics";
import ProductsCRUD from "./components/ProductsCRUD";
import { Product, CartItem, Order, OrderStatus } from "./types";
import { ShieldCheck, Info } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"storefront" | "admin">("storefront");
  const [adminActivePage, setAdminActivePage] = useState<"dashboard" | "products">("dashboard");

  // Databases state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Customer states
  const [customerName, setCustomerName] = useState("Audrey Vance");
  const [customerEmail, setCustomerEmail] = useState("audrey@vance.net");

  // UI Drawer/Overlay States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);

  // Cart operations (with dynamic persistent LocalStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const memory = localStorage.getItem("nexus_session_cart");
    return memory ? JSON.parse(memory) : [];
  });

  // Promo operations
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");

  // Sync with persistent LocalStorage
  useEffect(() => {
    localStorage.setItem("nexus_session_cart", JSON.stringify(cart));
  }, [cart]);

  // Initial Rest data queries fetching
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const prodRes = await fetch("/api/products");
        const prodJson = await prodRes.json();
        if (prodJson.success) {
          setProducts(prodJson.data);
        }

        const ordRes = await fetch("/api/orders");
        const ordJson = await ordRes.json();
        if (ordJson.success) {
          setOrders(ordJson.data);
        }
      } catch (err) {
        console.error("Initial catalog ingestion failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleApplyPromo = (code: string) => {
    if (code.trim().toUpperCase() === "WELCOME10") {
      setPromoApplied(true);
    } else {
      alert("Invalid coupon token code.");
    }
  };

  // Add Item to cart
  const handleAddToCart = (productId: string, variantId: string, quantity: number) => {
    setCart((prevCart) => {
      const idx = prevCart.findIndex((x) => x.productId === productId && x.variantId === variantId);
      if (idx > -1) {
        const itemCopy = { ...prevCart[idx] };
        itemCopy.quantity += quantity;
        const newCart = [...prevCart];
        newCart[idx] = itemCopy;
        return newCart;
      } else {
        return [...prevCart, { productId, variantId, quantity }];
      }
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, variantId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          const nextVal = item.quantity + delta;
          return { ...item, quantity: Math.max(1, nextVal) };
        }
        return item;
      });
    });
  };

  // Remove item outright
  const handleRemoveItem = (productId: string, variantId: string) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.productId === productId && item.variantId === variantId)));
  };

  // Create Product Design (Admin backoffice)
  const handleCreateProduct = async (newProduct: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => [...prev, json.data]);
      }
    } catch (err) {
      alert(`CRUD upload error: ${err}`);
    }
  };

  // Update Product (Admin backoffice)
  const handleUpdateProduct = async (id: string, partial: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...json.data } : p)));
      }
    } catch (err) {
      alert(`CRUD update error: ${err}`);
    }
  };

  // Delete Product (Admin backoffice)
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert(`CRUD delete error: ${err}`);
    }
  };

  // Update logistics shipping status (Admin backoffice)
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, tracking?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber: tracking }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...json.data } : o)));
      }
    } catch (err) {
      alert(`Status update failure: ${err}`);
    }
  };

  // Refund Order (Admin backoffice - Stripe webhook simulator interaction)
  const handleRefundOrder = async (orderId: string) => {
    try {
      const res = await fetch("/api/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...json.data } : o)));
        
        // Refresh catalog quantities to reflect restored state
        const updatedCatRes = await fetch("/api/products");
        const updatedCatJson = await updatedCatRes.json();
        if (updatedCatJson.success) {
          setProducts(updatedCatJson.data);
        }

        alert(json.message);
      } else {
        alert(json.message);
      }
    } catch (err) {
      alert(`Stripe refund initialization failure: ${err}`);
    }
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950 font-sans">
      {/* Persisted Header Switching perspective */}
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedProduct(null);
          setCartOpen(false);
          setCheckoutMode(false);
        }}
        cartCount={cartItemsCount}
        onOpenCart={() => setCartOpen(true)}
        customerName={customerName}
      />

      {/* Persistent floating notification bar explaining user options */}
      <div className="bg-zinc-900 border-b border-zinc-805 py-2.5 px-4 text-center text-xxs font-mono flex items-center justify-center gap-2 text-zinc-400">
        <ShieldCheck className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 animate-ping" />
        <span>
          <strong>OFFLINE SANDBOX MODE ACTIVE</strong> — Stripe credentials simulated. Log in to the merchant panel or view detailed stats by switching views above. Passcode is bypassed.
        </span>
      </div>

      <main className="flex-1 pb-16">
        {currentView === "storefront" ? (
          /* ========================================================== */
          /* CUSTOMER STOREFRONT LAYOUT */
          /* ========================================================== */
          checkoutMode ? (
            <CheckoutPanel
              cart={cart}
              products={products}
              onBackToStore={() => setCheckoutMode(false)}
              onClearCart={() => setCart([])}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              promoApplied={promoApplied}
            />
          ) : (
            <StorefrontCatalogue
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              isLoading={isLoading}
            />
          )
        ) : (
          /* ========================================================== */
          /* MERCHANT ADMIN PANEL VIEW */
          /* ========================================================== */
          <div className="space-y-4">
            {/* Admin page selection sub-menu controller */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex gap-3 border-b border-zinc-905 pb-3">
              <button
                onClick={() => setAdminActivePage("dashboard")}
                className={`px-4 py-2 font-mono text-xs font-bold rounded-lg border transition-all ${
                  adminActivePage === "dashboard"
                    ? "bg-zinc-800 text-amber-500 border-amber-500/20"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                Telemetry Dashboard &amp; Stripe Dispatches
              </button>
              <button
                onClick={() => setAdminActivePage("products")}
                className={`px-4 py-2 font-mono text-xs font-bold rounded-lg border transition-all ${
                  adminActivePage === "products"
                    ? "bg-zinc-800 text-amber-500 border-amber-500/20"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                Catalogue Backoffice CRUD
              </button>
            </div>

            {adminActivePage === "dashboard" ? (
              <DashboardAnalytics
                products={products}
                orders={orders}
                onRefundOrder={handleRefundOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onSelectProduct={(p) => {
                  setSelectedProduct(p);
                  setCurrentView("storefront");
                }}
              />
            ) : (
              <ProductsCRUD
                products={products}
                onCreateProduct={handleCreateProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating detail drawer */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Right sliding cart controls sidebar representation */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        products={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        promoApplied={promoApplied}
        promoCodeInput={promoCodeInput}
        setPromoCodeInput={setPromoCodeInput}
        onApplyPromo={handleApplyPromo}
        onGoToCheckout={() => {
          setCartOpen(false);
          setCheckoutMode(true);
        }}
      />

      {/* Dynamic humanistic Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-500 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-sans font-extrabold text-white tracking-wide">NEXUS</span>
            <span className="text-zinc-650 font-mono text-3xs">// SYSTEM PLATFORM INC</span>
          </div>
          <p className="font-mono text-3xs text-zinc-650 text-center sm:text-right uppercase">
            Designed for Google AI Studio • Production Sandbox Version • SSL 256 Token
          </p>
        </div>
      </footer>
    </div>
  );
}
