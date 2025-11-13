import { Link } from "react-router-dom"
import { PRODUCTS } from "../data/products"
import type { Product } from "../data/products"
import { useMemo, useState } from "react"

export default function Home() {
  const [q, setQ] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured")

  // derive categories from PRODUCTS (unique)
  const categories = useMemo(() => {
    const set = new Set<string>()
    PRODUCTS.forEach((p: any) => {
      if ((p as any).category) set.add((p as any).category)
    })
    return Array.from(set)
  }, [])

  // filtered + sorted list
  const filtered = useMemo(() => {
    let list = PRODUCTS.slice()
    if (activeCategory) {
      list = list.filter((p: any) => p.category === activeCategory)
    }
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter((p) =>
        (p.title || "").toString().toLowerCase().includes(s) ||
        (p.description || "").toString().toLowerCase().includes(s)
      )
    }
    if (sort === "price-asc") list.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sort === "price-desc") list.sort((a, b) => (b.price || 0) - (a.price || 0))
    return list
  }, [q, activeCategory, sort])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              স্মার্ট হোমে স্বাগতম — <span className="text-blue-600">বাঁচান সময়, বাঁচান বিদ্যুত</span>
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
              সেরা স্মার্ট গ্যাজেট, দ্রুত ডেলিভারি ও বিশ্বস্ত সার্ভিস। আমাদের নির্বাচিত পণ্যগুলো দেখুন — বাড়ির জীবনে আরাম আনুন।
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-md font-medium shadow">
                সকল প্রোডাক্ট দেখুন
              </Link>
              <Link to="/product/prod-001" className="inline-flex items-center justify-center border border-gray-200 px-5 py-3 rounded-md text-gray-700 hover:shadow">
                হিট প্রোডাক্ট দেখুন
              </Link>
            </div>

            {/* Search & quick filters (compact) */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 flex items-center bg-gray-100 rounded-md px-3 py-2">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"></path>
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="প্রোডাক্ট/বিবরণ দিয়ে সার্চ করুন (উদা. হিটার)"
                  className="bg-transparent outline-none w-full text-sm"
                  aria-label="Search products"
                />
                {q && <button onClick={() => setQ("")} className="text-sm text-gray-500 px-2">✕</button>}
              </div>

              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="text-sm rounded-md border px-3 py-2 bg-white">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div className="w-full lg:w-1/2 hidden md:block">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img src="/hero.jpg" alt="hero" className="w-full h-64 md:h-80 lg:h-96 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Category strip (shopify-like) */}
      <section className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">ক্যাটেগরি</h2>
          <div className="text-sm text-gray-500">{filtered.length} টি পণ্য দেখা যাচ্ছে</div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm ${!activeCategory ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            All
          </button>

          {categories.length === 0 && (
            <>
              <button className="px-4 py-2 rounded-full text-sm bg-white border">হোম</button>
              <button className="px-4 py-2 rounded-full text-sm bg-white border">কিচেন</button>
              <button className="px-4 py-2 rounded-full text-sm bg-white border">লাইটিং</button>
            </>
          )}

          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory((s) => (s === c ? null : c))}
              className={`px-4 py-2 rounded-full text-sm ${activeCategory === c ? "bg-blue-600 text-white" : "bg-white border"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid (Shopify-style cards) */}
      <section className="max-w-screen-xl mx-auto px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p: Product) => (
            <article key={p.id} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition overflow-hidden flex flex-col">
              <Link to={`/product/${p.id}`} className="block relative">
                <div className="w-full h-52 overflow-hidden">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover transform transition duration-300 hover:scale-105" loading="lazy" />
                </div>

                <div className="absolute left-3 top-3">
                  <span className="bg-white/90 text-xs px-2 py-1 rounded shadow-sm text-gray-800">Best</span>
                </div>
              </Link>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm md:text-base font-medium text-gray-900 leading-tight">{p.title}</h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{typeof p.description === "string" ? p.description : ""}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">৳ {p.price.toLocaleString()}</div>
                    {p.regularPrice && <div className="text-xs text-gray-400 line-through">৳ {p.regularPrice.toLocaleString()}</div>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/product/${p.id}`} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md shadow">Buy</Link>
                    <button className="px-2 py-2 border rounded-md text-gray-600 hover:bg-gray-100" title="Add to wishlist (future)">
                      ♡
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            কোনো পণ্য মিলেনি — সার্চ টার্ম বদলান অথবা ক্যাটেগরি পরিবর্তন করে দেখুন।
          </div>
        )}
      </section>
    </div>
  )
}
