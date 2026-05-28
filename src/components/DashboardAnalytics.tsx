import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { 
  TrendingUp, ShoppingCart, DollarSign, Activity, 
  RefreshCcw, ChevronRight, Package, Truck, Award, AlertCircle 
} from "lucide-react";
import { Order, AnalyticsSummary, Product, OrderStatus } from "../types";

interface DashboardAnalyticsProps {
  products: Product[];
  orders: Order[];
  onRefundOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, tracking?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export default function DashboardAnalytics({
  products,
  orders,
  onRefundOrder,
  onUpdateOrderStatus,
  onSelectProduct
}: DashboardAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderTab, setSelectedOrderTab] = useState<OrderStatus | "ALL">("ALL");
  const [inputTrackingMap, setInputTrackingMap] = useState<Record<string, string>>({});

  // Fetch real-time metrics stats compiled by server
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/analytics");
        const json = await res.json();
        if (json.success) {
          setAnalytics(json.data);
        }
      } catch (err) {
        console.error("Failed fetching analytics data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [orders, products]);

  if (isLoading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        <p className="mt-4 text-zinc-400 font-mono text-sm uppercase">LOADING PERSISTED PRISMA METRICS...</p>
      </div>
    );
  }

  // Filter orders according to selected tab status
  const visibleOrders = orders.filter((o) => {
    if (selectedOrderTab === "ALL") return true;
    return o.status === selectedOrderTab;
  });

  const handleTrackingValueChange = (orderId: string, value: string) => {
    setInputTrackingMap((prev) => ({ ...prev, [orderId]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-sans font-extrabold text-white tracking-tight">Admin Control Panel</h2>
          <p className="text-zinc-500 text-xs font-mono mt-1">REAL-TIME BUSINESS TELEMETRY & STRIPE DISPATCH DESK</p>
        </div>
        <div className="text-xxs font-mono text-zinc-400 bg-zinc-900 border border-zinc-850 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
          <span>STRIPE LIVE INBOX CONDUIT ONLINE</span>
        </div>
      </div>

      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Revenue */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xxs font-mono text-zinc-500 uppercase font-bold">Total Gross Revenue</span>
            <p className="text-2xl font-bold font-mono text-amber-500">${analytics.revenue.toFixed(2)}</p>
            <span className="text-xxs font-mono text-xs text-green-400 font-medium">Synced with Stripe API</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <DollarSign className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Stat 2: Orders Count */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xxs font-mono text-zinc-500 uppercase font-bold">Order Fulfilments</span>
            <p className="text-2xl font-bold font-mono text-zinc-100">{analytics.ordersCount} checkouts</p>
            <span className="text-xxs font-mono text-xs text-indigo-400 font-medium">{orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length} pending dispatch</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <ShoppingCart className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Stat 3: Average Order Value */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xxs font-mono text-zinc-500 uppercase font-bold">Average Order Value (AOV)</span>
            <p className="text-2xl font-bold font-mono text-zinc-100">${analytics.averageOrderValue}.00</p>
            <span className="text-xxs font-mono text-xs text-amber-500 font-medium">Optimal basket ratio</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Stat 4: Conversion Funnel Rate */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xxs font-mono text-zinc-500 uppercase font-bold">Lighthouse Conversion</span>
            <p className="text-2xl font-bold font-mono text-zinc-100">{analytics.conversionRate}%</p>
            <span className="text-xxs font-mono text-xs text-green-400 font-medium">Target Met (score 95+)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
            <Activity className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs (Area & Bar Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart Part: Revenue trends */}
        <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">Revenue Stream Analysis</h3>
              <p className="text-xxs font-mono text-zinc-500">CHUTE AND BASKET PERFORMANCE FOR WEEK ACTIVE</p>
            </div>
          </div>
          
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#4b5563" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px", color: "white" }} 
                  labelStyle={{ fontWeight: "bold", fontFamily: "JetBrains Mono" }}
                  itemStyle={{ color: "#fbbf24", fontFamily: "JetBrains Mono" }}
                />
                <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel conversion statistics */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="pb-2 border-b border-zinc-900">
            <h3 className="text-sm font-semibold text-white font-sans">Checkout Funnel Efficiency</h3>
            <p className="text-xxs font-mono text-zinc-500">VISITS CONVERSIONS PIPELINE</p>
          </div>

          <div className="space-y-4">
            {analytics.funnelSteps.map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono font-medium">{step.stage}</span>
                  <span className="text-white font-bold font-mono">{step.count} ({step.percentage}%)</span>
                </div>
                {/* Visual bar tracker */}
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${step.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders processing control section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Stripe Dispatch & Fulfilment Logs</h3>
            <p className="text-xxs font-mono text-zinc-500">UPDATE LOGISTICS AND TRIGGER WEBHOOK REFUNDS</p>
          </div>

          {/* Sorters tabs Row */}
          <div className="flex flex-wrap gap-1 bg-zinc-900/50 border border-zinc-850/80 p-1 rounded-xl">
            {(["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "REFUNDED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedOrderTab(tab)}
                className={`px-3 py-1 rounded-lg text-xxs font-mono font-bold transition-all ${
                  selectedOrderTab === tab ? "bg-zinc-800 text-amber-500 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TanStack Simulated virtualised table */}
        <div className="overflow-x-auto border border-zinc-900 rounded-2xl bg-zinc-905">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/40 text-xxs font-mono text-zinc-500 uppercase tracking-widest">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date Registered</th>
                <th className="p-4">Status</th>
                <th className="p-4">Pricing Total</th>
                <th className="p-4">Delivery Dispatch Code</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300 font-mono">
              {visibleOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No orders reported under selected status parameters.
                  </td>
                </tr>
              ) : (
                visibleOrders.map((order) => {
                  const statusColors: Record<OrderStatus, string> = {
                    PENDING: "bg-zinc-800 text-zinc-300 border-zinc-700",
                    PROCESSING: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
                    SHIPPED: "bg-blue-400/10 text-blue-400 border-blue-400/20",
                    DELIVERED: "bg-green-400/10 text-green-400 border-green-400/20",
                    REFUNDED: "bg-red-400/10 text-red-400 border-red-500/20",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-zinc-900/20 transition-all">
                      {/* Code */}
                      <td className="p-4 font-bold text-white">{order.id}</td>
                      
                      {/* Customer email */}
                      <td className="p-4">
                        <div className="font-sans font-medium text-white">{order.customerName}</div>
                        <div className="text-xxs text-zinc-500 font-mono">{order.customerEmail}</div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-zinc-400 text-xxs">
                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xxs font-bold border ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-white font-bold font-sans">${order.total.toFixed(2)}</td>

                      {/* Tracking or manual input */}
                      <td className="p-4">
                        {order.status === "REFUNDED" ? (
                          <span className="text-xxs text-zinc-650">REFUNDED IN FULL</span>
                        ) : order.trackingNumber ? (
                          <span className="text-xxs text-green-400 font-bold flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <div className="flex gap-2 max-w-[150px]">
                            <input
                              type="text"
                              placeholder="Trk Num..."
                              value={inputTrackingMap[order.id] || ""}
                              onChange={(e) => handleTrackingValueChange(order.id, e.target.value)}
                              className="bg-zinc-900 border border-zinc-850 rounded px-1.5 py-1 text-4xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 w-full"
                            />
                            <button
                              onClick={() => {
                                const tracking = inputTrackingMap[order.id];
                                onUpdateOrderStatus(order.id, "SHIPPED", tracking || "SHIP-CODE-GEN");
                              }}
                              className="bg-amber-500 text-zinc-950 px-1.5 py-1 rounded font-bold text-6xs uppercase hover:bg-amber-400 cursor-pointer"
                            >
                              Dispatch
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Refund Trigger Action */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status !== "REFUNDED" && order.status !== "DELIVERED" && (
                            <button
                              onClick={() => {
                                if (confirm(`Proceed with Stripe refund of $${order.total} to user ${order.customerEmail}? This will restore respective product variant stocks.`)) {
                                  onRefundOrder(order.id);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-zinc-950 border border-red-500/10 hover:border-transparent rounded-lg text-xxs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <RefreshCcw className="h-3 w-3" />
                              <span>Stripe Refund</span>
                            </button>
                          )}

                          {order.status === "PROCESSING" && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, "DELIVERED")}
                              className="px-2.5 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-zinc-950 border border-green-500/10 hover:border-transparent rounded-lg text-xxs transition-all cursor-pointer font-bold"
                            >
                              Deliver
                            </button>
                          )}
                          
                          {order.status === "DELIVERED" && (
                            <span className="text-xxs text-green-400 p-1 flex items-center gap-1">
                              <Award className="h-3.5 w-3.5" />
                              Captured
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
