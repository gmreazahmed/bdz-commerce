// src/data/products.ts
export type Product = {
  id: string
  title: string
  description: string
  price: number
  regularPrice?: number
  images: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: "prod-001",
    title: "হিটার জগ",
    description:
      "শীতের সকালে বা অফিসে চা–কফির সময় গরম পানি চাই — এই স্মার্ট হিটার জগ ৫৫° অটো টেম্পারেচার কন্ট্রোল দেয়।",
    price: 1650,
    regularPrice: 2350,
    images: ["/products/1.jpg", "https://picsum.photos/seed/p2/800/600"]
  },
  {
    id: "prod-002",
    title: "পোর্টেবল ব্লেন্ডার",
    description:
      "হ্যান্ডি ব্লেন্ডার — চার্জেবল ও লাইটওয়েট, ভ্রমণ ও রুটিন ব্যবহারের জন্য উপযোগী।",
    price: 2200,
    regularPrice: 2850,
    images: ["https://picsum.photos/seed/pb/800/600"]
  }
]
