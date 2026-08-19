// Convex schema for the TechMania platform. Mirrors the legacy Base44
// entities so frontend adapters and seed scripts see the same field names.
// Nested/array payloads (order items, specs, option values…) are stored with
// v.any() to preserve the original shape without a migration tax.

import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const json = v.any();

export default defineSchema({
  ...authTables,
  products: defineTable({
    name: v.string(),
    slug: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    brand: v.optional(v.string()),
    family: v.optional(v.string()),
    sku: v.optional(v.string()),
    price: v.optional(v.string()),
    price_cents: v.optional(v.number()),
    cost_cents: v.optional(v.number()),
    stock: v.optional(v.number()),
    low_stock_threshold: v.optional(v.number()),
    status: v.optional(v.string()),
    badge: v.optional(v.string()),
    category: v.optional(v.string()),
    category_id: v.optional(v.id("categories")),
    option_names: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    compare_group: v.optional(v.string()),
    specs: v.optional(json),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    colors: v.optional(json),
    description: v.optional(v.string()),
    sort_order: v.optional(v.number()),
    is_mockup: v.optional(v.boolean()),
    shopify_product_id: v.optional(v.string()),
    source: v.optional(v.string()),
    synced_at: v.optional(v.string()),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  })
    .index("by_sort_order", ["sort_order"]),

  product_variants: defineTable({
    product_id: v.id("products"),
    title: v.string(),
    sku: v.string(),
    barcode: v.optional(v.string()),
    option_values: v.optional(json),
    color_hex: v.optional(v.string()),
    price_cents: v.number(),
    compare_at_cents: v.optional(v.number()),
    cost_cents: v.optional(v.number()),
    stock: v.optional(v.number()),
    low_stock_threshold: v.optional(v.number()),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    is_default: v.optional(v.boolean()),
    sort_order: v.optional(v.number()),
    shopify_product_id: v.optional(v.string()),
    shopify_variant_id: v.optional(v.string()),
    synced_at: v.optional(v.string()),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  })
    .index("by_product", ["product_id"])
    .index("by_sort", ["product_id", "sort_order"]),

  categories: defineTable({
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    parent_id: v.optional(v.id("categories")),
    status: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    image: v.optional(v.string()),
    sort_order: v.optional(v.number()),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  })
    .index("by_sort_order", ["sort_order"]),

  assets: defineTable({
    name: v.optional(v.string()),
    url: v.string(),
    category: v.optional(v.string()),
    storage_id: v.optional(v.string()),
    created_date: v.optional(v.string()),
  }).index("by_created", ["created_date"]),

  orders: defineTable({
    order_number: v.string(),
    customer_name: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    customer_phone: v.optional(v.string()),
    items: v.optional(json),
    subtotal_cents: v.optional(v.number()),
    discount_amount_cents: v.optional(v.number()),
    shipping_cents: v.optional(v.number()),
    shipping_name: v.optional(v.string()),
    shipping_phone: v.optional(v.string()),
    shipping_address: v.optional(json),
    total_cents: v.optional(v.number()),
    bundle_discount_cents: v.optional(v.number()),
    status: v.optional(v.string()),
    discount_code: v.optional(v.string()),
    stripe_session_id: v.optional(v.string()),
    stripe_event_id: v.optional(v.string()),
    paid_at: v.optional(v.string()),
    tracking_number: v.optional(v.string()),
    carrier: v.optional(v.string()),
    shipped_date: v.optional(v.string()),
    delivered_date: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  })
    .index("by_number", ["order_number"])
    .index("by_stripe_session", ["stripe_session_id"])
    .index("by_created", ["created_date"]),

  discounts: defineTable({
    code: v.string(),
    type: v.string(),
    value: v.number(),
    active: v.optional(v.boolean()),
    usage_count: v.optional(v.number()),
    max_uses: v.optional(v.number()),
    expires_at: v.optional(v.string()),
    description: v.optional(v.string()),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  })
    .index("by_code", ["code"])
    .index("by_created", ["created_date"]),

  customers: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    total_spent: v.optional(v.number()),
    orders_count: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  })
    .index("by_created", ["created_date"]),

  // Extend Convex Auth's user record with the legacy storefront fields while
  // preserving the indexes and fields required by the auth library.
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()),
    created_date: v.optional(v.string()),
  }).index("email", ["email"]).index("phone", ["phone"]),

  notifications: defineTable({
    type: v.optional(v.string()),
    title: v.string(),
    message: v.optional(v.string()),
    severity: v.optional(v.string()),
    read: v.optional(v.boolean()),
    link: v.optional(v.string()),
    ref_id: v.optional(v.string()),
    created_date: v.optional(v.string()),
  }).index("by_created", ["created_date"]),

  settings: defineTable({
    key: v.string(),
    value: v.optional(v.string()),
    label: v.optional(v.string()),
    is_mockup: v.optional(v.boolean()),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  }).index("by_key", ["key"]),

  receipts: defineTable({
    receipt_number: v.string(),
    type: v.optional(v.string()),
    party_name: v.optional(v.string()),
    party_email: v.optional(v.string()),
    party_address: v.optional(v.string()),
    items: v.optional(json),
    subtotal_cents: v.optional(v.number()),
    tax_cents: v.optional(v.number()),
    total_cents: v.optional(v.number()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
    order_id: v.optional(v.id("orders")),
    payment_method: v.optional(v.string()),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  }).index("by_created", ["created_date"]),

  returns: defineTable({
    return_number: v.string(),
    order_number: v.optional(v.string()),
    order_id: v.optional(v.id("orders")),
    product_name: v.optional(v.string()),
    product_id: v.optional(v.id("products")),
    variant_id: v.optional(v.id("product_variants")),
    sku: v.optional(v.string()),
    customer_name: v.optional(v.string()),
    customer_email: v.optional(v.string()),
    reason: v.optional(v.string()),
    quantity: v.optional(v.number()),
    refund_cents: v.optional(v.number()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
    created_date: v.optional(v.string()),
    updated_date: v.optional(v.string()),
  }).index("by_created", ["created_date"]),

  webhook_events: defineTable({
    event_id: v.string(),
    event_type: v.optional(v.string()),
    session_id: v.optional(v.string()),
    order_id: v.optional(v.string()),
    status: v.optional(v.string()),
    effects_pending: v.optional(v.boolean()),
    effects_errors: v.optional(v.string()),
    reconciled_at: v.optional(v.string()),
    processed_at: v.optional(v.string()),
  }),
});
