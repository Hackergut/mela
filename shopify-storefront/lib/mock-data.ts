import type { Product } from "./shopify-types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/1",
    title: "iPhone 15 Pro Max",
    handle: "iphone-15-pro-max",
    description: "Fotocamera di livello professionale, chip A17 Pro ultraveloce e design in titanio di grado aerospaziale.",
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "1299.00", currencyCode: "EUR" }
    },
    featuredImage: {
      url: "/assets/iphone-image-2619-2264.png",
      altText: "iPhone 15 Pro Max",
      width: 800,
      height: 800
    },
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/101",
          title: "Titanio Naturale / 256GB",
          availableForSale: true,
          price: { amount: "1299.00", currencyCode: "EUR" },
          selectedOptions: [
            { name: "Colore", value: "Titanio Naturale" },
            { name: "Capacità", value: "256GB" }
          ]
        }
      ]
    }
  },
  {
    id: "gid://shopify/Product/2",
    title: "PlayStation 5 Slim",
    handle: "playstation-5-slim",
    description: "Esperienza di gioco Next-Gen con grafica 4K a 120Hz e SSD ultraveloce integrato.",
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "499.00", currencyCode: "EUR" }
    },
    featuredImage: {
      url: "/assets/playstation-2619-2204.png",
      altText: "PlayStation 5 Slim",
      width: 800,
      height: 800
    },
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/102",
          title: "Standard Edition",
          availableForSale: true,
          price: { amount: "499.00", currencyCode: "EUR" },
          selectedOptions: [{ name: "Edizione", value: "Digital / Disc" }]
        }
      ]
    }
  },
  {
    id: "gid://shopify/Product/3",
    title: "AirPods Max",
    handle: "airpods-max",
    description: "Audio ad alta fedeltà con cancellazione attiva del rumore e modalità trasparenza.",
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "579.00", currencyCode: "EUR" }
    },
    featuredImage: {
      url: "/assets/hero-gnfk5g59t0qe-xlarge-2x-1-2619-2194.png",
      altText: "AirPods Max",
      width: 800,
      height: 800
    },
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/103",
          title: "Nero Spaziale",
          availableForSale: true,
          price: { amount: "579.00", currencyCode: "EUR" },
          selectedOptions: [{ name: "Colore", value: "Nero Spaziale" }]
        }
      ]
    }
  },
  {
    id: "gid://shopify/Product/4",
    title: "Apple Vision Pro",
    handle: "apple-vision-pro",
    description: "Il primo spatial computer al mondo per realtà immersiva e lavoro senza confini.",
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "3499.00", currencyCode: "EUR" }
    },
    featuredImage: {
      url: "/assets/image-61-2619-1982.png",
      altText: "Apple Vision Pro",
      width: 800,
      height: 800
    },
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/104",
          title: "256GB",
          availableForSale: true,
          price: { amount: "3499.00", currencyCode: "EUR" },
          selectedOptions: [{ name: "Capacità", value: "256GB" }]
        }
      ]
    }
  },
  {
    id: "gid://shopify/Product/5",
    title: "MacBook Pro 16\" M3 Max",
    handle: "macbook-pro-16-m3",
    description: "Potenza di calcolo estrema con il chip Apple M3 Max e display Liquid Retina XDR.",
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: "2899.00", currencyCode: "EUR" }
    },
    featuredImage: {
      url: "/assets/banner-2-2619-2128.png",
      altText: "MacBook Pro 16 M3",
      width: 800,
      height: 800
    },
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/105",
          title: "Nero Spaziale / 36GB RAM / 1TB SSD",
          availableForSale: true,
          price: { amount: "2899.00", currencyCode: "EUR" },
          selectedOptions: [{ name: "Configurazione", value: "M3 Max" }]
        }
      ]
    }
  }
];
