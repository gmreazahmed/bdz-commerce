import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type { Product } from "../data/products"
import { PRODUCTS as LOCAL_PRODUCTS } from "../data/products"

// optional firestore fetch (modular)
import { getApp, initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore"

async function fetchProductsFromFirestore(limitCount = 100, startAfterDoc?: any): Promise<Product[]> {
  try {
    let app
    try { app = getApp() } catch (e) {
      const cfg = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      }
      if (!cfg.apiKey || !cfg.projectId) throw new Error("Firebase not configured")
      app = initializeApp(cfg)
    }
    const db = getFirestore(app)
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(limitCount))
    const snap = await getDocs(q)
    return snap.docs.map(d => {
      const data = d.data() as any
      return {
        id: d.id,
        title: data.title || "",
        description: data.description || "",
        price: Number(data.price || 0),
        regularPrice: data.regularPrice ? Number(data.regularPrice) : undefined,
        images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
        category: data.category || undefined,
      } as Product
    })
  } catch (err) {
    // throw to signal fallback
    throw err
  }
}

export default function AllProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [q, setQ] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured")
  const [perPage] = useState(12) // items shown initially (Load more will show all loaded items)
  const [visibleCount, setVisibleCount] = useState(perPage)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchProductsFromFirestore(200)
      .then(arr => {
        if (!mounted) return
        if (Array.isArray(arr) && arr.length) setProducts(arr)
        else setProducts(LOCAL_PRODUCTS)
      })
      .catch(() => {
        setProducts(LOCAL_PRODUCTS)
        setError("Firestore পাওয়া যাচ্ছে না — লোকাল পণ্য দেখানো হচ্ছে।")
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  // derived categories
  const categories = useMemo(() => {
    const s = new Set<string>()
    products.forEach((p: any) => { if (p?.category) s.add(p.category) })
    return Array.from(s)
  }, [products])

  const filtered = useMemo(() => {
    let list = products.slice()
    if (category) list = list.filter(p => p.category === category)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter(p =>
        (p.title || "").toString().toLowerCase().includes(s) ||
        (p.description || "").toString().toLowerCase().includes(s)
      )
    }
    if (sort === "price-asc") list.sort((a, b) => (a.price || 0) - (b.price || 0))
    if (sort === "price-desc") list.sort((a, b) => (b.price || 0) - (a.price || 0))
    return list
  }, [products, q, category, sort])

  const shown = filtered.slice(0, visibleCount)
  const canLoadMore = visibleCount < filtered.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">All Products</h1>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} টি পণ্য — {error ? <span className="text-yellow-600">{error}</span> : null}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-white border rounded px-3 py-1.5">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products" className="outline-none text-sm w-48 md:w-64" />
              {q && <button onClick={() => setQ("")} className="ml-2 text-sm text-gray-500">✕</button>}
            </div>

            <select value={category ?? ""} onChange={e => setCategory(e.target.value || null)} className="text-sm rounded border px-3 py-1.5 bg-white">
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={sort} onChange={e => setSort(e.target.value as any)} className="text-sm rounded border px-3 py-1.5 bg-white">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading products…</div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {shown.map(p => (
                <article key={p.id} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition overflow-hidden flex flex-col">
                  <Link to={`/product/${p.id}`} className="block relative">
                    <div className="w-full h-44 overflow-hidden bg-gray-100">
                      <img src={p.images?.[0] || "/placeholder.png"} alt={p.title} className="w-full h-full object-cover transform transition duration-300 hover:scale-105" loading="lazy" />
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm md:text-base font-medium text-gray-900 leading-tight">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{typeof p.description === "string" ? p.description : ""}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">৳ {Number(p.price).toLocaleString()}</div>
                        {p.regularPrice && <div className="text-xs text-gray-400 line-through">৳ {Number(p.regularPrice).toLocaleString()}</div>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/product/${p.id}`} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md shadow">Buy</Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">কোনো পণ্য পাওয়া যায়নি।</div>
            )}

            {filtered.length > perPage && (
              <div className="mt-8 flex justify-center">
                {canLoadMore ? (
                  <button onClick={() => setVisibleCount(c => c + perPage)} className="px-6 py-2 bg-gray-100 rounded-md">Load more</button>
                ) : (
                  <button onClick={() => setVisibleCount(perPage)} className="px-6 py-2 bg-white border rounded-md">Show less</button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
