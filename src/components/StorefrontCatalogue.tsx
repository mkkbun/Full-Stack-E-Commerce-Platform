import { useState, useMemo } from "react";
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Star, Layers, Sparkles } from "lucide-react";
import { Product } from "../types";

interface StorefrontCatalogueProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  isLoading: boolean;
}

export default function StorefrontCatalogue({ products, onSelectProduct, isLoading }: StorefrontCatalogueProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState<number>(400);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("featured");

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

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    result = result.filter((p) => p.price <= priceRange);

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // featured / natural
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, search, priceRange, minRating, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        <p className="mt-4 text-zinc-400 font-mono text-sm">LOADING PREMIUM ARCHITECTURAL CATALOGUE...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-zinc-950 border border-zinc-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-500">
            <Sparkles className="h-3 w-3 animate-spin" />
            <span>SEASONAL DROP ELEVATION</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-sans font-extrabold tracking-tight text-white">
            Unsaturated Tech <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Meets Pure Form</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Our latest curated collection merges high-performance materials, technical detailing, 
            and pristine aesthetics to produce robust accessories engineered for modern life.
          </p>
        </div>
        <div className="hidden lg:block w-72 h-44 relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600" 
            alt="Nexus Sneakers" 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 to-transparent p-3">
            <p className="text-xxs font-mono text-amber-500">FEATURED PRODUCT // SEED CODE 03</p>
          </div>
        </div>
      </div>

      {/* Grid Filter Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Rail */}
        <div className="space-y-6 lg:border-r lg:border-zinc-800 lg:pr-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white tracking-widest uppercase flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-amber-500" />
              <span>Filters</span>
            </h3>
            {(selectedCategory !== "All" || search.trim() || priceRange < 400 || minRating > 0) && (
              <button 
                onClick={() => {
                  setSelectedCategory("All");
                  setSearch("");
                  setPriceRange(400);
                  setMinRating(0);
                }}
                className="text-xs text-amber-500 hover:text-amber-400 font-mono"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
          </div>

          {/* Categories select row */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3 font-mono">
              Category
            </label>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono text-left transition-all ${
                    selectedCategory === cat
                      ? "bg-zinc-800 text-amber-400 border border-amber-500/30 shadow-md font-semibold"
                      : "text-zinc-400 bg-zinc-900/40 border border-zinc-800/80 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{cat}</span>
                    <Layers className="h-3 w-3 opacity-30" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3 font-mono">
              Max Price: <span className="text-amber-500">${priceRange}</span>
            </label>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer text-amber-500"
            />
            <div className="flex justify-between text-xxs text-zinc-500 font-mono mt-1">
              <span>$50</span>
              <span>$400</span>
            </div>
          </div>

          {/* Rating filter select circles */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3 font-mono">
              Minimum Rating
            </label>
            <div className="flex items-center space-x-2">
              {[0, 4, 4.5, 4.8].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    minRating === stars
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                      : "bg-zinc-900 text-zinc-400 border-zinc-805 hover:bg-zinc-800"
                  }`}
                >
                  {stars === 0 ? "Any" : `${stars}★`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <p className="text-zinc-400 text-xs font-mono">
              SHOWING <span className="text-white font-semibold">{filteredProducts.length}</span> CURATED STYLES
            </p>

            {/* Sorters */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-zinc-500" />
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-900 border border-zinc-850 text-zinc-300 text-xs rounded-lg py-1.5 px-2.5 outline-none focus:border-amber-500 font-mono"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl">
              <SlidersHorizontal className="h-8 w-8 text-zinc-650 mb-3" />
              <p className="text-zinc-300 font-medium">No results match your selected criteria</p>
              <p className="text-zinc-500 text-xs font-mono mt-1">Try resetting the ranges, query filters or select other categories</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                return (
                  <div
                    key={p.id}
                    id={`product-card-${p.id}`}
                    onClick={() => onSelectProduct(p)}
                    className="group bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-md hover:shadow-amber-500/5 hover:-translate-y-1 hover:border-zinc-700 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Thumbnail Container */}
                      <div className="relative aspect-square bg-zinc-900/60 overflow-hidden">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        {/* Featured Badge */}
                        {p.featured && (
                          <span className="absolute top-3 left-3 px-2 py-1 rounded bg-amber-500 text-zinc-950 font-bold tracking-widest text-xxs font-mono shadow-md">
                            MUST HAVE
                          </span>
                        )}

                        {/* Stock Overlay Indicator */}
                        {totalStock < 5 && totalStock > 0 ? (
                          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-red-400/10 border border-red-500/20 text-red-400 text-xxs font-mono">
                            LIMITED: ONLINE {totalStock} LEFT
                          </span>
                        ) : totalStock === 0 ? (
                          <span className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center text-red-500 text-xs font-mono font-bold tracking-widest">
                            CATALOGUE RUN DEPLETED
                          </span>
                        ) : null}
                      </div>

                      <div className="p-4 space-y-2">
                        {/* Meta Category and Star Rating Row */}
                        <div className="flex items-center justify-between text-xxs font-mono text-zinc-400">
                          <span>{p.category.toUpperCase()}</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {p.rating}
                          </span>
                        </div>

                        {/* Title & Short description */}
                        <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1">
                          {p.name}
                        </h4>
                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-zinc-900 bg-zinc-900/20 flex items-center justify-between">
                      {/* Price Element */}
                      <span className="text-lg font-bold font-mono text-zinc-100">${p.price}.00</span>
                      
                      {/* Interactive Trigger btn */}
                      <span className="text-xs bg-zinc-800 group-hover:bg-amber-500 group-hover:text-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-700/60 group-hover:border-transparent font-medium transition-all duration-200">
                        View Details
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
