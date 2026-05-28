import { X, Trash2, ArrowRight, Minus, Plus, ShoppingBag, ShieldCheck, Sparkles } from "lucide-react";
import { Product, CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onUpdateQuantity: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onGoToCheckout: () => void;
  promoApplied: boolean;
  promoCodeInput: string;
  setPromoCodeInput: (val: string) => void;
  onApplyPromo: (code: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onGoToCheckout,
  promoApplied,
  promoCodeInput,
  setPromoCodeInput,
  onApplyPromo,
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Resolve cart items with products & variants details
  const resolvedItems = cart.map((item) => {
    const prod = products.find((p) => p.id === item.productId);
    const variant = prod?.variants.find((v) => v.id === item.variantId);
    return {
      ...item,
      product: prod,
      variant,
    };
  }).filter(item => item.product && item.variant);

  const subtotal = resolvedItems.reduce((acc, item) => {
    return acc + (item.product?.price || 0) * item.quantity;
  }, 0);

  const promoReduction = promoApplied ? subtotal * 0.1 : 0;
  const taxableSubtotal = subtotal - promoReduction;
  const tax = taxableSubtotal * 0.1;
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 15;
  const total = taxableSubtotal + tax + shipping;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/80 backdrop-blur-xs flex justify-end">
      {/* Tap close region */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>

      <div 
        className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 text-white flex flex-col justify-between shadow-2xl h-full animate-in slide-in-from-right duration-300"
        id="cart-drawer-container"
      >
        {/* Draw Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-white tracking-tight">Your Session Cart</h2>
            <span className="bg-zinc-800 text-zinc-400 text-xxs font-mono px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Item Loop */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {resolvedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center space-y-4">
              <ShoppingBag className="h-10 w-10 text-zinc-700 animate-bounce" />
              <p className="text-zinc-300 text-sm">Your cart is perfectly empty.</p>
              <p className="text-zinc-500 text-xs font-mono">Add technical apparel to begin secure checkout sync.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-500 font-mono rounded-lg cursor-pointer"
              >
                Go back to shop
              </button>
            </div>
          ) : (
            resolvedItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-4 p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl"
              >
                {/* Thumb */}
                <img
                  src={item.product?.images[0]}
                  alt={item.product?.name}
                  className="w-16 h-16 rounded-lg object-cover bg-zinc-950 border border-zinc-900"
                  referrerPolicy="no-referrer"
                />

                {/* Info & Quantity controls wrapper */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-semibold text-white line-clamp-1">{item.product?.name}</h4>
                      <p className="text-xxs font-mono text-zinc-400">
                        {item.variant?.color} • {item.variant?.size}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.productId, item.variantId)}
                      className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.variantId, -1)}
                        className="p-1 px-2 text-zinc-400 hover:text-white text-xs disabled:opacity-20 font-bold"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-mono text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.variantId, 1)}
                        className="p-1 px-2 text-zinc-400 hover:text-white text-xs"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="text-xs font-bold font-mono text-amber-400">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo and Checkouts section */}
        {resolvedItems.length > 0 && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900/10 space-y-4">
            {/* Promo application fields */}
            <div className="space-y-2">
              <label className="text-xxs font-mono text-zinc-450 uppercase block">Promocode: Try &quot;WELCOME10&quot;</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  disabled={promoApplied}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg py-1 px-2 text-xs text-white focus:outline-none focus:border-amber-500 flex-1 uppercase font-mono"
                />
                <button
                  onClick={() => onApplyPromo(promoCodeInput)}
                  disabled={promoApplied || !promoCodeInput.trim()}
                  className="bg-zinc-850 hover:bg-zinc-800 text-xs px-3 py-1 text-white rounded-lg transition-colors font-mono disabled:opacity-50 cursor-pointer"
                >
                  {promoApplied ? "Applied" : "Apply"}
                </button>
              </div>
              {promoApplied && (
                <p className="text-green-400 text-xxs font-mono flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Promo applied successfully: 10% subtotal deduction</span>
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs border-t border-zinc-900 pt-3">
              <div className="flex justify-between text-zinc-450 font-mono">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-400 font-mono">
                  <span>Promo code discount</span>
                  <span>-${promoReduction.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-450 font-mono">
                <span>Stripe computed Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-450 font-mono">
                <span>Shipping fee</span>
                <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-white font-bold font-mono pt-2 border-t border-dashed border-zinc-850">
                <span className="flex items-center gap-1.5">
                  Total Limit
                </span>
                <span className="text-amber-400 font-extrabold text-base">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkouts call to action */}
            <button
              id="goto-checkout-drawer-btn"
              onClick={onGoToCheckout}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer transition-all active:scale-95"
            >
              <span>Initialize Secure Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="text-center text-xxs text-zinc-500 font-mono flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
              <span>Full SSL Protected Sandbox Checkouts</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
