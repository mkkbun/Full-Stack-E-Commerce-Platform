import React, { useState, useMemo } from "react";
import { Star, ShieldCheck, RefreshCw, Headphones, ShoppingCart, Sparkles, SlidersHorizontal, ArrowUpDown, Layers, Heart } from "lucide-react";
import { Product } from "../types";

interface StorefrontCatalogueProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedCollection: string;
  setSelectedCollection: (val: string) => void;
}

export default function StorefrontCatalogue({
  products,
  onSelectProduct,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCollection,
  setSelectedCollection,
}: StorefrontCatalogueProps) {
  const [priceRange, setPriceRange] = useState<number>(300);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const memory = localStorage.getItem("nexus_session_wishlist");
    return memory ? JSON.parse(memory) : [];
  });

  const handleToggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlist((prev) => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter((x) => x !== id);
      } else {
        next = [...prev, id];
      }
      localStorage.setItem("nexus_session_wishlist", JSON.stringify(next));
      return next;
    });
  };

  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(list)];
  }, [products]);

  // Client side active filtering
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedCollection !== "All") {
      if (selectedCollection === "Featured Drops") {
        result = result.filter((p) => p.featured);
      } else if (selectedCollection === "Stealth Luxe") {
        result = result.filter((p) => p.price > 100);
      } else if (selectedCollection === "Core Essentials") {
        result = result.filter((p) => p.price <= 100);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    result = result.filter((p) => p.price <= priceRange);

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, selectedCollection, searchQuery, priceRange, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        {/* Glowing Loading design */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
        </div>
        <p className="mt-6 text-zinc-400 font-mono text-xs tracking-widest text-center animate-pulse">
          INGESTING NEXUS CENTRAL DATABASES...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ========================================== */}
      {/* GLOWING HERO BANNER (REPLICATED FROM MOCK) */}
      {/* ========================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-900 shadow-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[300px]">
        {/* Subtle orange/amber glowing node backgrounds */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md md:max-w-xl space-y-5 z-10 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-xs font-mono text-amber-500 font-semibold tracking-wider">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>SPRING DROP CONCEPTS LIVE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white leading-tight">
            Discover premium <br /> <span className="text-amber-500">products: built for</span> quality, made for you.
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg">
            Our limited-batch creations synthesize high-grade materials, ergonomic structural formulas, 
            and meticulous detailing to fit seamlessly into modern technical lifestyles.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                const element = document.getElementById("featured-header-trigger");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-display font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/10 transform duration-200"
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Hero Product Artwork */}
        <div className="relative w-64 h-64 flex items-center justify-center z-10 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full filter blur-xl animate-pulse"></div>
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
            alt="Quantum Headset"
            className="w-56 h-56 object-contain transform hover:scale-105 duration-300 drop-shadow-[0_20px_20px_rgba(245,158,11,0.15)]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-2 inset-x-0 text-center bg-zinc-950/80 border border-zinc-900 rounded-lg px-2 py-1 text-[9px] font-mono text-amber-500 w-max mx-auto shadow-md">
            SEED CODE: QUANTUM_05
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* PRODUCTS SECTION SECTION */}
      {/* ========================================== */}
      <div className="space-y-6">
        <div 
          id="featured-header-trigger"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4"
        >
          <div>
            <h2 className="text-xl font-display font-semibold text-white tracking-tight">Featured Products</h2>
            <p className="text-zinc-500 text-xs font-mono mt-0.5 uppercase">
              {filteredProducts.length} Premium Designs In Stock
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Minimal Price Filter */}
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-400">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
              <span>Max Price:</span>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-20 sm:w-28 accent-amber-500 cursor-pointer text-amber-500 h-1 bg-zinc-900 rounded"
              />
              <span className="text-amber-500 font-bold">${priceRange}</span>
            </div>

            {/* Sorting Selection */}
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-400">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-zinc-200 outline-none cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-low">Price: Low-High</option>
                <option value="price-high">Price: High-Low</option>
                <option value="rating">Reviews Tier</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Badges indicators */}
        {(selectedCategory !== "All" || selectedCollection !== "All" || searchQuery.trim()) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-mono uppercase">Applied Targets:</span>
            {selectedCategory !== "All" && (
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500 font-mono text-[11px] flex items-center gap-1">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory("All")} className="text-zinc-500 hover:text-white ml-1">×</button>
              </span>
            )}
            {selectedCollection !== "All" && (
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500 font-mono text-[11px] flex items-center gap-1">
                <span>Collection: {selectedCollection}</span>
                <button onClick={() => setSelectedCollection("All")} className="text-zinc-500 hover:text-white ml-1">×</button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-500 font-mono text-[11px] flex items-center gap-1">
                <span>Search: &quot;{searchQuery}&quot;</span>
                <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-white ml-1">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedCollection("All");
                setSearchQuery("");
                setPriceRange(300);
              }}
              className="text-amber-500 hover:underline font-mono text-xs ml-auto"
            >
              Reset active filters
            </button>
          </div>
        )}

        {/* Product listings */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-950/40 border border-dashed border-zinc-900 rounded-3xl text-center">
            <SlidersHorizontal className="h-8 w-8 text-zinc-700 mb-3" />
            <p className="text-zinc-300 font-display font-medium text-sm">No premium products match your filtering criteria</p>
            <p className="text-zinc-500 text-xs font-mono mt-1">Try resetting the slider, clear selection parameters, or insert another search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const inWishlist = wishlist.includes(p.id);
              const starCount = 5;

              return (
                <div
                  key={p.id}
                  id={`product-card-${p.id}`}
                  onClick={() => onSelectProduct(p)}
                  className="group bg-zinc-950 border border-zinc-900/80 rounded-2xl overflow-hidden shadow-xl hover:-translate-y-1 hover:border-zinc-855 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Image container aligned in focus frame */}
                  <div className="relative p-6 bg-zinc-900/30 flex items-center justify-center aspect-square border-b border-zinc-900/60 overflow-hidden">
                    {/* Glowing circular element in card background on hover */}
                    <div className="absolute inset-0 bg-radial-to-t from-amber-500/0 via-amber-500/0 to-transparent group-hover:from-amber-600/5 duration-500 pointer-events-none"></div>
                    
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-11/12 h-11/12 object-contain group-hover:scale-105 duration-500 pointer-events-none drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />

                    {/* Highly aesthetic heart icon for wishlisting */}
                    <button
                      onClick={(e) => handleToggleWishlist(e, p.id)}
                      className={`absolute top-3.5 right-3.5 p-2 rounded-xl border transition-all ${
                        inWishlist
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                          : "bg-zinc-900/80 border-zinc-900 text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${inWishlist ? "fill-amber-500" : ""}`} />
                    </button>

                    {/* Featured Drop label */}
                    {p.featured && (
                      <span className="absolute top-3.5 left-3.5 px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono font-extrabold text-[9px] tracking-widest uppercase">
                        Featured Drop
                      </span>
                    )}
                  </div>

                  {/* Card Metadata (Replicating exact text alignments in mockup) */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name */}
                      <h4 className="font-display font-medium text-white group-hover:text-amber-400 transition-colors text-sm text-left leading-normal line-clamp-1">
                        {p.name}
                      </h4>
                      {/* Price below name, aligned flat */}
                      <p className="text-zinc-400 font-mono text-xs text-left mt-0.5 font-semibold">
                        ${p.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Visual yellow ratings star array on left */}
                      <div className="flex items-center gap-0.5">
                        <div className="flex text-amber-500">
                          {Array.from({ length: starCount }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(p.rating) ? "fill-amber-500 text-amber-500" : "text-zinc-800"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-zinc-500 font-mono text-[10px] ml-1">
                          ({Math.round(((p.price * 99) % 150) + 20)})
                        </span>
                      </div>

                      {/* Iconic Amber Square Checkout trigger button on right */}
                      <div className="bg-amber-500 hover:bg-amber-400 text-zinc-950 p-2 rounded-lg shadow-md group-hover:shadow-amber-500/10 transition-all">
                        <ShoppingCart className="h-4 w-4 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* BOTTOM TRUST BADGES (REPLICATED FROM MOCK) */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-zinc-900 text-left">
        {/* Badge 1 */}
        <div className="flex items-start gap-4 p-5 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <ShieldCheck className="h-6 w-6 stroke-1.5" />
          </div>
          <div>
            <h5 className="font-display font-medium text-white text-sm">Secure Payments</h5>
            <p className="text-zinc-500 text-xs mt-1 leading-normal">
              Your payments are processed immediately and fully secured using standard AES 256 dispatches.
            </p>
          </div>
        </div>

        {/* Badge 2 */}
        <div className="flex items-start gap-4 p-5 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <RefreshCw className="h-6 w-6 stroke-1.5" />
          </div>
          <div>
            <h5 className="font-display font-medium text-white text-sm">Easy Returns</h5>
            <p className="text-zinc-500 text-xs mt-1 leading-normal">
              Change your mind? Restitution is easy! 30-day sandboxed return dispatches on all items.
            </p>
          </div>
        </div>

        {/* Badge 3 */}
        <div className="flex items-start gap-4 p-5 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Headphones className="h-6 w-6 stroke-1.5" />
          </div>
          <div>
            <h5 className="font-display font-medium text-white text-sm">24/7 Support</h5>
            <p className="text-zinc-500 text-xs mt-1 leading-normal">
              Have questions regarding sizing or specifications? Live team is online ready to assist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
