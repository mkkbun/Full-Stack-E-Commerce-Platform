/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import StorefrontCatalogue from "./components/StorefrontCatalogue";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutPanel from "./components/CheckoutPanel";
import DashboardAnalytics from "./components/DashboardAnalytics";
import ProductsCRUD from "./components/ProductsCRUD";
import { Product, CartItem, Order, OrderStatus } from "./types";
import {
  Home,
  Layers,
  Sparkles,
  Package,
  Heart,
  User,
  Settings as SettingsIcon,
  Truck,
  Search,
  ShoppingCart,
  Menu,
  X,
  ShieldCheck,
  Award,
  PlusCircle,
  HelpCircle,
  Calendar,
  Mail,
  UserCheck
} from "lucide-react";

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState<
    "home" | "categories" | "collections" | "orders" | "wishlist" | "profile" | "settings" | "admin"
  >("home");

  // Admin section toggles underneath "settings" or accessible via sidebar
  const [adminMode, setAdminMode] = useState(false);
  const [adminActivePage, setAdminActivePage] = useState<"dashboard" | "products">("dashboard");

  // Mobile menu open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Databases state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Customer credentials
  const [customerName, setCustomerName] = useState("Audrey Vance");
  const [customerEmail, setCustomerEmail] = useState("audrey@vance.net");
  const [customerAddress, setCustomerAddress] = useState("72 Luxury Penthouse Rd, San Francisco CA");

  // Filter query parameters lifted for cross-navigation
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCollection, setSelectedCollection] = useState("All");

  // UI Drawer/Overlay States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);

  // Simulated Wishlist states (persisting via LocalStorage)
  const [wishlistCount, setWishlistCount] = useState(0);

  // Synchronize wishlist count dynamically
  useEffect(() => {
    const memory = localStorage.getItem("nexus_session_wishlist");
    const list = memory ? JSON.parse(memory) : [];
    setWishlistCount(list.length);
  }, [activeTab, selectedProduct]);

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
        alert("Product added to live product catalog!");
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
        alert("Catalog product updated!");
      }
    } catch (err) {
      alert(`CRUD update error: ${err}`);
    }
  };

  // Delete Product (Admin backoffice)
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product from the database?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        alert("Product expunged successfully.");
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

  // Trigger demo reset list
  const handleResetCatalog = async () => {
    if (confirm("Reset current orders dataset? This restores the central inventory metrics.")) {
      window.location.reload();
    }
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter list of wishlist items to display in its own tab
  const wishlistProducts = products.filter((p) => {
    const memory = localStorage.getItem("nexus_session_wishlist");
    const list = memory ? JSON.parse(memory) : [];
    return list.includes(p.id);
  });

  // Orders made by this customized account
  const customerOrders = orders.filter((o) => o.customerEmail.toLowerCase() === customerEmail.toLowerCase());

  interface NavItem {
    id: "home" | "categories" | "collections" | "orders" | "wishlist" | "profile" | "settings" | "admin";
    label: string;
    icon: any;
    badge?: number;
  }

  // Left Sidebar list of Navigation Items with labels and icons
  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "collections", label: "Collections", icon: Sparkles },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart, badge: wishlistCount > 0 ? wishlistCount : undefined },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: SettingsIcon },
    { id: "admin", label: "Admin Panel", icon: ShieldCheck },
  ];

  const handleSidebarClick = (id: NavItem["id"]) => {
    setCheckoutMode(false);
    setMobileMenuOpen(false);

    if (id === "admin") {
      setAdminMode(true);
      setActiveTab("admin");
    } else {
      setAdminMode(false);
      setActiveTab(id);
    }

    // Trigger direct state configuration based on selection
    if (id === "categories") {
      setSelectedCategory("All");
    } else if (id === "collections") {
      setSelectedCollection("Featured Drops");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row justify-between selection:bg-amber-400 selection:text-zinc-950 font-sans">
      {/* ========================================== */}
      {/* PERSISTENT LEFT SIDEBAR FOR DESKTOP */}
      {/* ========================================== */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-zinc-950 border-r border-zinc-900 h-screen sticky top-0 p-6 z-30">
        <div className="space-y-8">
          {/* Logo Brand Frame */}
          <div
            className="flex items-center gap-3 cursor-pointer py-2 border-b border-zinc-900/40"
            onClick={() => handleSidebarClick("home")}
          >
            <div className="bg-amber-500 text-zinc-950 p-2 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-amber-500/10">
              <span className="font-display tracking-tight text-base font-extrabold text-zinc-950">N</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-widest text-white block">
                NEXUS
              </span>
              <span className="text-[9px] text-zinc-500 font-mono tracking-widest block uppercase">
                SYSTEM PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1.5 text-left">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSidebarClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-150 ${
                    isActive
                      ? "bg-zinc-900 text-amber-500 font-semibold border-l-2 border-amber-500"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-amber-500 animate-pulse" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-amber-500/15 text-amber-500 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-500/10">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Promotional Free Shipping Card (Mockup elements) */}
        <div className="p-4 bg-zinc-900/30 border border-zinc-904 rounded-2xl flex items-start gap-4 text-left">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 mt-0.5">
            <Truck className="h-5 w-5 stroke-1.5" />
          </div>
          <div className="space-y-1">
            <h5 className="font-display font-bold text-white text-xs">Free Shipping</h5>
            <p className="text-zinc-500 text-[10px] leading-snug">On all orders over $50 inside sandbox state.</p>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MOBILE HEADER BAR & HAMBURGER CONTROL */}
      {/* ========================================== */}
      <header className="flex lg:hidden items-center justify-between px-4 py-4 bg-zinc-950 border-b border-zinc-900 w-full z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display tracking-widest text-sm font-extrabold text-white">NEXUS</span>
        </div>

        {/* Customer Badge and Cart triggers */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-250 hover:text-white transition-all"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-[10px] font-extrabold h-4.5 w-4.5 rounded-full flex items-center justify-center border border-zinc-950">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* COLLAPSIBLE MOBILE MENU SIDEBAR OVERLAY */}
      {/* ========================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex justify-start lg:hidden">
          <div className="absolute inset-0" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-72 bg-zinc-950 border-r border-zinc-900 p-6 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <span className="font-display font-extrabold text-lg text-white tracking-widest">NEXUS</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="space-y-1 text-left">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSidebarClick(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-150 ${
                        isActive
                          ? "bg-zinc-900 text-amber-500 font-semibold"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex items-start gap-3 text-left">
              <Truck className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h5 className="font-display font-bold text-white text-xs">Free Shipping</h5>
                <p className="text-zinc-500 text-[9px] leading-normal">On orders over $50 inside sandbox state.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* RIGHT MAIN CONTENT AREA CANVAS */}
      {/* ========================================== */}
      <main className="flex-1 min-h-screen flex flex-col justify-between bg-zinc-950 overflow-x-hidden border-l border-zinc-950">
        {/* Core panel block wrapper */}
        <div className="flex-1">
          {/* TOP BAR / UNIVERSAL ACTION ROW */}
          <section className="bg-zinc-950 border-b border-zinc-900/60 sticky top-0 z-20 py-4 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input Box */}
            <div className="relative w-full sm:max-w-md text-left">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "home" && activeTab !== "categories" && activeTab !== "collections") {
                    setActiveTab("home");
                  }
                }}
                className="w-full pl-4 pr-10 py-2.5 bg-zinc-900 border border-zinc-900 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-550/40 transition-all"
              />
              <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-500" />
            </div>

            {/* Quick Access Indicators (Cart trigger, client card display) */}
            <div className="flex items-center justify-end gap-4 w-full sm:w-auto">
              {/* Profile Brief Badge */}
              <div
                onClick={() => handleSidebarClick("profile")}
                className="flex items-center gap-2 text-zinc-300 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-900 py-1.5 px-3 rounded-xl cursor-pointer text-xs font-mono transition-colors"
              >
                <div className="h-5 w-5 rounded-full bg-amber-500/15 border border-amber-500 text-amber-500 flex items-center justify-center font-bold text-[10px]">
                  AV
                </div>
                <span className="hidden md:inline font-semibold">{customerName}</span>
              </div>

              {/* Cart Drawer Button */}
              <button
                id="header-cart-btn"
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-zinc-905 border border-zinc-900 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all duration-200"
              >
                <ShoppingCart className="h-4.5 w-4.5 text-zinc-300" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-550 bg-amber-500 text-zinc-950 text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-zinc-950">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* Persistent global Offline Simulation warning banner */}
          <div className="bg-zinc-900/30 border-b border-zinc-900/60 py-2 px-4 text-center text-[10px] font-mono flex items-center justify-center gap-2 text-zinc-550 text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>
              <strong>OFFLINE PLATFORM ENVIRONMENT ACTIVE</strong> — Simulated dispatches fully functional. Adjust account VIP tier, track live orders, or toggle admin tools directly.
            </span>
          </div>

          {/* MAIN PAGE PANEL DELEGATOR */}
          <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
            {checkoutMode ? (
              /* ========================================================== */
              /* SECURE EXPRESS CHECKOUT PANEL */
              /* ========================================================== */
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
            ) : adminMode ? (
              /* ========================================================== */
              /* MERCHANT BACKOFFICE VIEW COMPACT SELECTION */
              /* ========================================================== */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 text-left">
                  <div>
                    <h2 className="text-xl font-display font-semibold text-white">Merchant Admin Panel</h2>
                    <p className="text-zinc-500 text-xs font-mono mt-0.5">SECURE BACKEND DISPATCH MANAGER</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAdminActivePage("dashboard")}
                      className={`px-4 py-2 font-mono text-xs font-bold rounded-xl border transition-all ${
                        adminActivePage === "dashboard"
                          ? "bg-zinc-900 text-amber-500 border-amber-500/20 shadow-md"
                          : "text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      Telemetry Dashboard
                    </button>
                    <button
                      onClick={() => setAdminActivePage("products")}
                      className={`px-4 py-2 font-mono text-xs font-bold rounded-xl border transition-all ${
                        adminActivePage === "products"
                          ? "bg-zinc-900 text-amber-500 border-amber-500/20 shadow-md"
                          : "text-zinc-500 border-transparent hover:text-zinc-300"
                      }`}
                    >
                      Catalogue CRUD
                    </button>
                    <button
                      onClick={() => {
                        setAdminMode(false);
                        setActiveTab("home");
                      }}
                      className="px-3 py-2 font-mono text-xs text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl"
                    >
                      Exit Admin
                    </button>
                  </div>
                </div>

                {adminActivePage === "dashboard" ? (
                  <DashboardAnalytics
                    products={products}
                    orders={orders}
                    onRefundOrder={handleRefundOrder}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onSelectProduct={(p) => {
                      setSelectedProduct(p);
                      setAdminMode(false);
                      setActiveTab("home");
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
            ) : (
              /* ========================================================== */
              /* DYNAMIC CUSTOMER VIEWS SELECTOR */
              /* ========================================================== */
              <>
                {/* 1. HOME VIEW */}
                {activeTab === "home" && (
                  <StorefrontCatalogue
                    products={products}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedCollection={selectedCollection}
                    setSelectedCollection={setSelectedCollection}
                  />
                )}

                {/* 2. CATEGORIES ADVANCED VIEW */}
                {activeTab === "categories" && (
                  <div className="space-y-6 text-left">
                    <div>
                      <h2 className="text-xl font-display font-semibold text-white tracking-tight">Advanced Categories</h2>
                      <p className="text-zinc-500 text-xs font-mono uppercase">Filter catalog lines dynamically by classification</p>
                    </div>

                    <div className="flex flex-wrap gap-2 py-2">
                      {["All", "Bags", "Watches", "Footwear", "Accessories", "Electronics", "Apparel"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-mono transition-all uppercase border ${
                            selectedCategory === cat
                              ? "bg-zinc-900 text-amber-400 border-amber-550/20 shadow-md font-bold"
                              : "text-zinc-400 bg-zinc-950 border-zinc-900 hover:bg-zinc-900"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <StorefrontCatalogue
                      products={products}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      isLoading={isLoading}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedCollection={selectedCollection}
                      setSelectedCollection={setSelectedCollection}
                    />
                  </div>
                )}

                {/* 3. COLLECTIONS VIEW */}
                {activeTab === "collections" && (
                  <div className="space-y-6 text-left">
                    <div>
                      <h2 className="text-xl font-display font-semibold text-white tracking-tight">Curated Collections</h2>
                      <p className="text-zinc-500 text-xs font-mono uppercase">Seasonal technical dropped concepts</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                      {[
                        { title: "Featured Drops", desc: "Our core spotlight drops, limited batches curated with distinct elements.", tag: "Featured Drops" },
                        { title: "Stealth Luxe", desc: "Premium technical lines certified above $100 focused on elite materials.", tag: "Stealth Luxe" },
                        { title: "Core Essentials", desc: "Accessible everyday tactical lifestyle utilities and items.", tag: "Core Essentials" },
                      ].map((col) => {
                        const isChosen = selectedCollection === col.tag;
                        return (
                          <div
                            key={col.title}
                            onClick={() => setSelectedCollection(col.tag)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between h-36 ${
                              isChosen
                                ? "bg-zinc-900/60 border-amber-500 text-white"
                                : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800"
                            }`}
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono uppercase text-amber-500">LIMITED ACCESS</span>
                              <h4 className="font-display font-semibold text-white">{col.title}</h4>
                              <p className="text-[11px] text-zinc-500 leading-normal">{col.desc}</p>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 underline uppercase self-end">
                              {isChosen ? "[Active Selection]" : "Configure target"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <StorefrontCatalogue
                      products={products}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      isLoading={isLoading}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedCollection={selectedCollection}
                      setSelectedCollection={setSelectedCollection}
                    />
                  </div>
                )}

                {/* 4. ORDERS HISTORY & TRACKER VIEW */}
                {activeTab === "orders" && (
                  <div className="space-y-6 text-left">
                    <div>
                      <h2 className="text-xl font-display font-semibold text-white tracking-tight">Account Session Orders</h2>
                      <p className="text-zinc-500 text-xs font-mono uppercase">Simulated checkout orders history logs</p>
                    </div>

                    {customerOrders.length === 0 ? (
                      <div className="p-12 bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl text-center space-y-4">
                        <Package className="h-10 w-10 text-zinc-700 mx-auto animate-bounce" />
                        <h4 className="text-zinc-300 font-display font-medium">No registered order lines found for this account</h4>
                        <p className="text-zinc-500 text-xs font-mono max-w-md mx-auto">
                          Place a simulated order by adding products, launching secure checkout, and finishing the Stripe dispatches.
                        </p>
                        <button
                          onClick={() => handleSidebarClick("home")}
                          className="bg-amber-500 text-zinc-950 font-mono font-bold text-xs px-4 py-2 rounded-xl"
                        >
                          Go check catalogs
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {customerOrders.map((ord) => {
                          const isRefunded = ord.status === "REFUNDED";

                          return (
                            <div
                              key={ord.id}
                              className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4 shadow-xl"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-900 pb-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-display font-semibold text-white">{ord.id}</span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                                      Simulated Live order
                                    </span>
                                  </div>
                                  <p className="text-zinc-500 text-xxs font-mono flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Issued: {new Date(ord.createdAt).toLocaleDateString()}</span>
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Order Status Badge with appropriate background coding */}
                                  <span
                                    className={`text-[10px] font-mono font-extrabold px-3 py-1 rounded-full uppercase ${
                                      ord.status === "DELIVERED"
                                        ? "bg-green-500/15 text-green-400 border border-green-500/20"
                                        : ord.status === "SHIPPED"
                                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                                        : ord.status === "PROCESSING"
                                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/20 animate-pulse"
                                        : ord.status === "REFUNDED"
                                        ? "bg-red-500/15 text-red-500 border border-red-500/20"
                                        : "bg-zinc-800 text-zinc-400"
                                    }`}
                                  >
                                    status: {ord.status}
                                  </span>
                                  <span className="text-sm font-bold font-mono text-amber-500">
                                    Total: ${ord.total.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {/* Order items nested list */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-xxs font-mono text-zinc-500 uppercase">Cart lines</p>
                                  {ord.items.map((it, idx) => {
                                    const matchingProd = products.find((p) => p.id === it.productId);
                                    return (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2 bg-zinc-900/30 border border-zinc-900 rounded-xl"
                                      >
                                        <img
                                          src={matchingProd?.images[0]}
                                          alt="product"
                                          className="w-10 h-10 object-cover bg-zinc-950 border border-zinc-900 rounded-lg"
                                        />
                                        <div>
                                          <h5 className="text-xs font-semibold text-white">{matchingProd?.name || "Product Item"}</h5>
                                          <p className="text-xxs font-mono text-zinc-450">
                                            Qty {it.quantity} • ${it.priceAtPurchase.toFixed(2)} unit
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Logistics timeline tracker */}
                                <div className="space-y-2">
                                  <p className="text-xxs font-mono text-zinc-500 uppercase">Tracking Timeline &amp; Destination</p>
                                  <div className="bg-zinc-900/10 border border-zinc-90s border-zinc-900 rounded-2xl p-3 text-xs space-y-3">
                                    <p className="text-[11px] text-zinc-400">
                                      <strong>Address:</strong> {ord.shippingAddress}
                                    </p>
                                    {ord.trackingNumber ? (
                                      <p className="text-[11px] text-amber-500 font-mono">
                                        <strong>Carrier Code:</strong> {ord.trackingNumber}
                                      </p>
                                    ) : (
                                      <p className="text-[11px] text-zinc-500 font-mono">
                                        <strong>Consignment status:</strong> Awaiting carrier parcel dispatch scan
                                      </p>
                                    )}

                                    {/* Tracking steps bar */}
                                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
                                      <span className={ord.status !== "REFUNDED" ? "text-amber-500 font-bold" : ""}>✓ Paid</span>
                                      <span className={["PROCESSING", "SHIPPED", "DELIVERED"].includes(ord.status) ? "text-amber-500 font-bold" : ""}>➔ Processed</span>
                                      <span className={["SHIPPED", "DELIVERED"].includes(ord.status) ? "text-amber-500 font-bold" : ""}>➔ Dispatch</span>
                                      <span className={ord.status === "DELIVERED" ? "text-amber-500 font-bold" : ""}>➔ Arrived</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. WISHLIST VIEW */}
                {activeTab === "wishlist" && (
                  <div className="space-y-6 text-left">
                    <div>
                      <h2 className="text-xl font-display font-semibold text-white tracking-tight">Your Wishlist</h2>
                      <p className="text-zinc-500 text-xs font-mono uppercase">Technical products saved in active memory</p>
                    </div>

                    {wishlistProducts.length === 0 ? (
                      <div className="p-12 bg-zinc-950 border border-dashed border-zinc-905 border-zinc-900 rounded-3xl text-center space-y-4">
                        <Heart className="h-10 w-10 text-zinc-700 mx-auto" />
                        <h4 className="text-zinc-300 font-display font-medium">Your wishlist is empty</h4>
                        <p className="text-zinc-500 text-xs font-mono max-w-sm mx-auto">
                          Tap the heart icon on any product card in the home catalogs to sync them to your persistent wishlist.
                        </p>
                        <button
                          onClick={() => handleSidebarClick("home")}
                          className="bg-zinc-900 hover:bg-zinc-805 text-amber-500 font-mono text-xs px-4 py-2 border border-zinc-800 rounded-xl"
                        >
                          Explore products
                        </button>
                      </div>
                    ) : (
                      <StorefrontCatalogue
                        products={wishlistProducts}
                        onSelectProduct={(p) => setSelectedProduct(p)}
                        isLoading={isLoading}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedCollection={selectedCollection}
                        setSelectedCollection={setSelectedCollection}
                      />
                    )}
                  </div>
                )}

                {/* 6. PROFILE CONFIGURATOR VIEW */}
                {activeTab === "profile" && (
                  <div className="max-w-2xl text-left space-y-6">
                    <div>
                      <h2 className="text-xl font-display font-semibold text-white tracking-tight">VIP Profile credentials</h2>
                      <p className="text-zinc-500 text-xs font-mono uppercase font-medium">Customize active billing settings</p>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 flex items-center justify-center font-display font-bold text-lg shadow-xl shadow-amber-500/15">
                          AV
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-semibold text-white text-base">{customerName}</h4>
                            <span className="bg-amber-500/10 text-amber-400 text-[9px] font-mono tracking-widest uppercase border border-amber-550/15 px-2 py-0.5 rounded">
                              BLACK VIP Tier
                            </span>
                          </div>
                          <p className="text-zinc-500 text-xs font-mono">MEMBER ACCOUNT ID: NEXUS_VIP_9981</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                        {/* Name Input */}
                        <div className="space-y-1">
                          <label className="text-xxs font-mono text-zinc-550 uppercase">Customer Fullname</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1">
                          <label className="text-xxs font-mono text-zinc-550 uppercase">Receipt Email Address</label>
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Address Input */}
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xxs font-mono text-zinc-550 uppercase">Default Cosignee Terminal Street Address</label>
                          <input
                            type="text"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-850 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xxs text-zinc-500 font-mono max-w-sm">
                          Adjusting profile settings updates metadata dispatches sent to Stripe during payment generation.
                        </p>
                        <button
                          onClick={() => alert("Simulated billing credentials updated")}
                          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-mono font-bold w-full sm:w-auto text-center"
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. SETTINGS & SANDBOX COMPILER CONTROL */}
                {activeTab === "settings" && (
                  <div className="max-w-2xl text-left space-y-6">
                    <div>
                      <h2 className="text-xl font-display font-semibold text-white tracking-tight">Platform Settings</h2>
                      <p className="text-zinc-500 text-xs font-mono uppercase">Simulated checkout controls &amp; developer mode toggles</p>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
                      {/* Developer Options Row */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <div>
                            <span className="font-display font-bold text-white text-sm block">Merchant Admin Control Backoffice</span>
                            <span className="text-zinc-500 text-xxs leading-normal">Reveal full catalog database edits capability (CRUD)</span>
                          </div>
                          <div>
                            <button
                              onClick={() => setAdminMode(!adminMode)}
                              className={`px-4 py-2 font-mono text-xs font-extrabold rounded-xl border transition-all ${
                                adminMode
                                  ? "bg-amber-500 text-zinc-950 border-amber-500/20"
                                  : "bg-zinc-900 text-zinc-450 border-zinc-800"
                              }`}
                            >
                              {adminMode ? "ADMIN PERSPECTIVE ON" : "TOGGLE PERSPECTIVE"}
                            </button>
                          </div>
                        </div>

                        {/* Promo Code description info box */}
                        <div className="p-4 bg-zinc-900/40 rounded-2xl space-y-2 border border-zinc-905 border-zinc-905">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                            <Award className="h-4 w-4 text-amber-500" />
                            <span>COGNITIVE COUPON TOKENS</span>
                          </h5>
                          <p className="text-zinc-500 text-xxs leading-normal">
                            Activate custom discount coupons in memory. Input voucher <strong>&quot;WELCOME10&quot;</strong> in your cart drawer to deduct 10% from computed cart subtotal lines securely.
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <div>
                            <h5 className="font-display font-bold text-white text-sm block">Re-seed Live Sandbox Databases</h5>
                            <p className="text-zinc-500 text-xxs leading-normal">Restore original in-memory seed models</p>
                          </div>
                          <button
                            onClick={handleResetCatalog}
                            className="bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 px-4 py-2 rounded-xl font-mono text-xs text-zinc-300"
                          >
                            Restore Seeds
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-900 text-center">
                        <p className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest text-zinc-500">
                          NEXUS SYSTEM ENGINE • BUILD R.981-TEST
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Floating product detail drawer */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Right sliding session cart controls sidebar */}
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
    </div>
  );
}
