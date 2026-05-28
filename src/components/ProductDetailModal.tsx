import { useState, useEffect } from "react";
import { X, Star, ShoppingCart, MessageSquare, RefreshCw, Layers } from "lucide-react";
import { Product, ProductVariant } from "../types";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productId: string, variantId: string, quantity: number) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  // Initialize values when product changes
  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
      // Default to first variant with stock, or just first variant
      const defaultVariant = product.variants.find((v) => v.stock > 0) || product.variants[0] || null;
      setSelectedVariant(defaultVariant);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const totalProductStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  const handleAddToCartClick = () => {
    if (!selectedVariant) return;
    onAddToCart(product.id, selectedVariant.id, quantity);
    
    // Trigger flash feedback
    setIsSuccessFeedback(true);
    setTimeout(() => {
      setIsSuccessFeedback(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        id="product-detail-modal-container"
      >
        {/* Floating Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          {/* Left Angle Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-900">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all.duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Gallery Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 bg-zinc-900 rounded-lg overflow-hidden border transition-all ${
                      activeImage === img ? "border-amber-500 scale-95" : "border-zinc-805 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Angle" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Selection details */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category Breadcrumb */}
              <div className="flex items-center space-x-2 text-xxs font-mono text-zinc-400 uppercase tracking-widest">
                <span>{product.category}</span>
                <span>/</span>
                <span className="text-amber-500">ID: {product.id}</span>
              </div>

              {/* Title & Price */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-tight">
                  {product.name}
                </h2>
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-bold font-mono text-amber-400">${product.price}.00</span>
                  <span className="text-xs text-zinc-500 font-mono">excluding tax</span>
                </div>
              </div>

              {/* Review Ratings Bar */}
              <div className="flex items-center space-x-2 bg-zinc-900/60 border border-zinc-900 px-3 py-1.5 rounded-xl w-fit">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(product.rating) ? "fill-amber-500 text-amber-500" : "text-zinc-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-zinc-300 font-bold font-mono">{product.rating}</span>
                <span className="text-zinc-500 text-xs">|</span>
                <span className="text-xxs font-mono text-zinc-450 tracking-wider flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  11 COGNITIVE REVIEWS
                </span>
              </div>

              {/* Detailed Description */}
              <p className="text-zinc-400 text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Product variants grid */}
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase font-mono">
                  Select Model Variant: <span className="text-white">{selectedVariant?.color || "None"} - {selectedVariant?.size}</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const isOutOfStock = v.stock === 0;

                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedVariant(v);
                            setQuantity(1);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all text-left ${
                          isOutOfStock
                            ? "border-zinc-900 text-zinc-650 line-through opacity-40 cursor-not-allowed"
                            : isSelected
                            ? "bg-amber-500/10 border-amber-500 text-white"
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {/* Color Dot Swatch */}
                          <span
                            className="h-3 w-3 rounded-full border border-zinc-950 shadow-inner flex-shrink-0"
                            style={{ backgroundColor: v.colorCode }}
                          ></span>
                          <span className="font-medium text-xs font-sans text-stone-100">{v.color}</span>
                          <span className="text-xxs font-mono text-zinc-450">({v.size})</span>
                        </div>
                        <span className="text-xxs font-mono text-zinc-500">
                          {v.stock === 0 ? "DEPLETED" : `${v.stock} in stock`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock notifications block */}
              <div className="pt-2 text-xxs font-mono flex items-center gap-1.5 text-zinc-400">
                <Layers className="h-3.5 w-3.5 text-amber-500" />
                <span>COMBINED REAL-TIME BATCH STOCK: </span>
                <span className={totalProductStock > 5 ? "text-green-400" : "text-amber-400 font-bold"}>
                  {totalProductStock > 0 ? `${totalProductStock} ITEMS GUARANTEED` : "DEPLETED"}
                </span>
              </div>
            </div>

            {/* Actions bottom bar */}
            {selectedVariant && selectedVariant.stock > 0 ? (
              <div className="pt-4 border-t border-zinc-900 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-zinc-400 hover:text-white font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-mono text-lg"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm text-white font-mono font-bold w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                      disabled={quantity >= selectedVariant.stock}
                      className="px-3 py-2 text-zinc-400 hover:text-white font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-mono text-lg"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right text-xxs font-mono text-zinc-500">
                    <span>Variant limit: {selectedVariant.stock} max</span>
                  </div>
                </div>

                <button
                  id="add-to-cart-action-btn"
                  onClick={handleAddToCartClick}
                  className={`w-full py-4.5 px-6 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm tracking-tight transition-all duration-300 transform cursor-pointer ${
                    isSuccessFeedback
                      ? "bg-green-500 text-zinc-950 scale-[0.99]"
                      : "bg-amber-500 text-zinc-950 hover:bg-amber-400 active:scale-95 shadow-xl shadow-amber-500/10"
                  }`}
                >
                  {isSuccessFeedback ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Optimistic allocation complete!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Secure cart allocation — ${(product.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl text-center text-red-500 font-mono text-xs">
                ⚠️ THE SELECTION HAS RUN OUT OF COGNITIVE STOCK
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
