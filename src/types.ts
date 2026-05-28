/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorCode: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  images: string[];
  variants: ProductVariant[];
  stock: number; // overall or current default
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'REFUNDED';

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  status: OrderStatus;
  paymentIntentId?: string;
  trackingNumber?: string;
}

export interface AnalyticsSummary {
  revenue: number;
  ordersCount: number;
  averageOrderValue: number;
  conversionRate: number; // %
  topProducts: { name: string; sales: number; revenue: number; image: string }[];
  funnelSteps: { stage: string; count: number; percentage: number }[];
  revenueData: { period: string; amount: number; orderCount: number }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}
