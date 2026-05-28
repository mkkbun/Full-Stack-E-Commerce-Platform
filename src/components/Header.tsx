import { ShoppingBag, ShieldCheck, ShoppingCart, UserCheck, Globe } from "lucide-react";

interface HeaderProps {
  currentView: "storefront" | "admin";
  onViewChange: (view: "storefront" | "admin") => void;
  cartCount: number;
  onOpenCart: () => void;
  customerName: string;
}

export default function Header({ currentView, onViewChange, cartCount, onOpenCart, customerName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950 text-white border-b border-zinc-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewChange("storefront")}>
          <div className="bg-amber-500 text-zinc-950 p-2 rounded-lg font-bold flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              NEXUS
            </span>
            <span className="text-zinc-400 text-xs block font-mono">E-COMMERCE PLATFORM</span>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            id="nav-storefront-btn"
            onClick={() => onViewChange("storefront")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === "storefront"
                ? "bg-amber-500 text-zinc-950 shadow-md font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Storefront</span>
          </button>
          <button
            id="nav-admin-btn"
            onClick={() => onViewChange("admin")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === "admin"
                ? "bg-amber-500 text-zinc-950 shadow-md font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Control Panel</span>
          </button>
        </div>

        {/* User Stats & Cart Counter */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center gap-2 text-zinc-300 bg-zinc-900/40 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-mono">
            <UserCheck className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-zinc-400">{customerName ? `Hi, ${customerName}` : "Guest Account"}</span>
          </div>

          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-805 text-zinc-100 hover:bg-zinc-800 hover:text-white transition-all duration-200"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-xxs font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-zinc-950 animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
