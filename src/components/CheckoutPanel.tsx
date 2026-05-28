import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, ShoppingBag, Sparkles, MapPin, Truck } from "lucide-react";
import { CartItem, Product, Order } from "../types";

interface CheckoutPanelProps {
  cart: CartItem[];
  products: Product[];
  onBackToStore: () => void;
  onClearCart: () => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  customerEmail: string;
  setCustomerEmail: (val: string) => void;
  promoApplied: boolean;
}

export default function CheckoutPanel({
  cart,
  products,
  onBackToStore,
  onClearCart,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  promoApplied,
}: CheckoutPanelProps) {
  // Address parameters
  const [addressInput, setAddressInput] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [addressCity, setAddressCity] = useState("");
  const [addressZip, setAddressZip] = useState("");

  const [paymentStep, setPaymentStep] = useState<"fill-info" | "processing" | "completed">("fill-info");
  const [procState, setProcState] = useState("");
  const [generatedOrder, setGeneratedOrder] = useState<Order | null>(null);

  // Stripe card mock details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Simulated Places dataset for Autocomplete
  const placesMock = [
    { text: "1600 Amphitheatre Pkwy, Mountain View, CA", city: "Mountain View", zip: "94043" },
    { text: "111 8th Avenue, New York, NY", city: "New York", zip: "10011" },
    { text: "1 St Martin's Le Grand, London, EC1A", city: "London", zip: "EC1A 4AS" },
    { text: "747 Skyline Drive, San Francisco, CA", city: "San Francisco", zip: "94103" }
  ];

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

  const handleAutocompleteSelect = (place: typeof placesMock[0]) => {
    setAddressInput(place.text);
    setAddressCity(place.city);
    setAddressZip(place.zip);
    setShowAutocomplete(false);
  };

  const handleTriggerPayment = async (e: any) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !addressInput) {
      alert("Please provide shipping and email credentials.");
      return;
    }

    setPaymentStep("processing");

    // PHASE 1: Generate Stripe Payment Intent on Node backend
    setProcState("Initiating SSL Connection with Stripe Gateway...");
    await new Promise((resolve) => setTimeout(resolve, 1100));

    setProcState("Generating payment intent with Stripe REST API...");
    
    try {
      const response = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          shippingAddress: `${addressInput}, ${addressCity}, ${addressZip}`,
          items: cart,
          total
        })
      });

      const resJson = await response.json();
      if (!resJson.success) {
        throw new Error(resJson.message);
      }

      // PHASE 2: Simulating Client-side Stripe checkout authentication loops
      setProcState("Authorizing 3D-Secure credentials on Stripe Payment Element...");
      await new Promise((resolve) => setTimeout(resolve, 1300));

      // PHASE 3: Trigger simulated payment update webhook (Idempotency checked)
      const eventId = "evt_" + Math.random().toString(36).substring(2, 10);
      setProcState("Processing verified server webhook with Idempotence checks...");

      const webhookResponse = await fetch("/api/checkout/webhook-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          paymentIntentId: resJson.paymentIntentId
        })
      });

      const webhookJson = await webhookResponse.json();
      if (webhookJson.success) {
        setGeneratedOrder(webhookJson.data);
      } else {
        setGeneratedOrder(resJson.order); // fallback
      }

      // PHASE 4: Order fulfilled
      setProcState("Finalizing shipping log with dispatch desk...");
      await new Promise((resolve) => setTimeout(resolve, 900));

      setPaymentStep("completed");
      onClearCart();
    } catch (err: any) {
      alert(`Simulation Error: ${err.message}`);
      setPaymentStep("fill-info");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Navigation and Title */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-xs font-mono font-bold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>BACK TO CATALOGUE</span>
        </button>
        <span className="text-xxs font-mono text-zinc-500 tracking-wider">SECURE PLATFORM</span>
      </div>

      {paymentStep === "fill-info" && (
        <form onSubmit={handleTriggerPayment} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form left inputs */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-500" />
              <span>Full-Stack Despatch Logistics</span>
            </h2>

            {/* Stage 1: Customer Contact details */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
                Customer Email & Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xxs font-mono text-zinc-500">CLIENT FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xxs font-mono text-zinc-500">CLIENT EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Stage 2: Shipping details with Place autocomp */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center justify-between">
                <span>Shipping Address</span>
                <span className="text-xxs text-amber-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Google Autocomplete Live
                </span>
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <label className="text-xxs font-mono text-zinc-500 block mb-1.5">STREET ADDRESS (TYPE TO TRIGGER AUTOCOMPLETE)</label>
                  <input
                    type="text"
                    required
                    value={addressInput}
                    onChange={(e) => {
                      setAddressInput(e.target.value);
                      setShowAutocomplete(e.target.value.length > 2);
                    }}
                    placeholder="Type address (e.g., 1600 Amphitheatre...)"
                    className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 pl-9 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <MapPin className="absolute left-3 top-9 h-4 w-4 text-zinc-500" />

                  {showAutocomplete && (
                    <div className="absolute top-16 left-0 right-0 z-20 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
                      {placesMock
                        .filter((p) => p.text.toLowerCase().includes(addressInput.toLowerCase()) || addressInput.length > 2)
                        .map((place) => (
                          <div
                            key={place.text}
                            onClick={() => handleAutocompleteSelect(place)}
                            className="p-3 hover:bg-zinc-800 text-xs text-white font-mono cursor-pointer border-b border-zinc-850/30 flex items-center gap-2"
                          >
                            <MapPin className="h-3 w-3 text-amber-500" />
                            <span>{place.text}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xxs font-mono text-zinc-500">CITY</label>
                    <input
                      type="text"
                      required
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="City"
                      className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xxs font-mono text-zinc-500">ZIP CODE</label>
                    <input
                      type="text"
                      required
                      value={addressZip}
                      onChange={(e) => setAddressZip(e.target.value)}
                      placeholder="Zip"
                      className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 3: Stripe Payment Element Form */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-500" />
                <span>Simulated Stripe Payment Element</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xxs font-mono text-zinc-500">CREDIT CARD NUMBER</label>
                  <input
                    type="text"
                    required
                    placeholder="4242 •••• •••• 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    maxLength={19}
                    className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xxs font-mono text-zinc-500">EXP DATE</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xxs font-mono text-zinc-500">CVC PIN</label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={3}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cart right details pane */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-semibold text-white tracking-widest uppercase font-mono">
              Inward Order Summary
            </h2>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-4">
              {/* Items loop list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {resolvedItems.map((item) => (
                  <div key={item.variantId} className="flex gap-3 justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product?.images[0]}
                        alt={item.product?.name}
                        className="w-10 h-10 object-cover bg-zinc-900 border border-zinc-800 rounded-lg flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-white font-medium line-clamp-1">{item.product?.name}</p>
                        <p className="text-xxs font-mono text-zinc-500">
                          {item.variant?.color} • Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-zinc-300">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals table */}
              <div className="border-t border-zinc-900 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500 font-mono">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-400 font-mono">
                    <span>Discount Included</span>
                    <span>-${promoReduction.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500 font-mono">
                  <span>Stripe Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-mono">
                  <span>Standard Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-white font-bold font-mono text-sm pt-2 border-t border-dashed border-zinc-850">
                  <span>Total Amount</span>
                  <span className="text-amber-500 font-extrabold">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                id="stripe-checkout-pay-btn"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs font-mono tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Submit Secure Stripe Payment</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Loading loop */}
      {paymentStep === "processing" && (
        <div className="flex flex-col items-center justify-center min-h-[450px] space-y-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 border-4 border-zinc-855 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-white text-md font-semibold font-mono tracking-tight animate-pulse">
              STRIPE TRANSACTION IN COGNITIVE PROCESSING
            </h3>
            <p className="text-zinc-500 text-xs font-mono">{procState}</p>
          </div>
        </div>
      )}

      {/* Success Receipt pane resembling React Email */}
      {paymentStep === "completed" && generatedOrder && (
        <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-10 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-full shadow-lg">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 text-xxs font-mono bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full text-zinc-400 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                TRANSACTION SECURED VIA STRIPE Webhook
              </span>
              <h3 className="text-2xl font-sans font-extrabold text-white tracking-tight">Order Confirmed</h3>
              <p className="text-zinc-400 text-xs font-mono mt-1">Invoice Code: {generatedOrder.id}</p>
            </div>
          </div>

          {/* Simulated React Email template body */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 space-y-4">
            <p className="text-zinc-300 text-xs font-mono">Hi {generatedOrder.customerName},</p>
            <p className="text-zinc-400 text-xs leading-relaxed">
              We have processed your checkout payment successfully! Below are your order transaction receipt summaries. 
              Our despatch desk will compile the dynamic tracking logs and email updates shortly.
            </p>

            <div className="border-t border-b border-zinc-900 py-3 space-y-2">
              <div className="flex justify-between text-xxs font-mono text-zinc-500">
                <span>Shipping Destination</span>
                <span className="text-zinc-300 text-right max-w-xs">{generatedOrder.shippingAddress}</span>
              </div>
              <div className="flex justify-between text-xxs font-mono text-zinc-500">
                <span>Stripe Charge Token</span>
                <span className="text-zinc-300">{generatedOrder.paymentIntentId || "pi_test_intent"}</span>
              </div>
              <div className="flex justify-between text-xxs font-mono text-zinc-500">
                <span>Payment Method</span>
                <span className="text-zinc-300">Stripe Card (•••• 4242)</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xxs font-mono text-zinc-500 block uppercase font-bold">Allocated Apparel</span>
              {resolvedItems.length === 0 && (
                <p className="text-zinc-500 text-xxs font-mono">Cart cleared to inventory desk.</p>
              )}
              {generatedOrder.items.map((item, idx) => {
                const itemProd = products.find(p => p.id === item.productId);
                return (
                  <div key={idx} className="flex justify-between text-xxs font-mono text-zinc-400">
                    <span>{itemProd?.name || `ProductID: ${item.productId}`} (x{item.quantity})</span>
                    <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between text-xs text-white font-bold border-t border-dashed border-zinc-850 pt-2 font-mono">
                <span>Secure Charge Total</span>
                <span className="text-amber-500">${generatedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onBackToStore}
              className="flex-1 py-3 bg-zinc-900 border border-zinc-805 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors text-center"
            >
              Back to Catalog
            </button>
            <button
              onClick={onBackToStore}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors text-center"
            >
              Track Deliveries Desk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
