// src/pages/AllProducts.tsx
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { PRODUCTS as LOCAL_PRODUCTS } from "../data/products"
import { db } from "../firebase/firebase"
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "firebase/firestore"

// unified type
type Product = {
  id: string
  title: string
  description?: string
  price: number
  regularPrice?: number
  images: string[]
  category?: string
}

export default function AllProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(12)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        // 1) fetch Firestore products
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          limit(200)
        )

        const snap = await getDocs(q)
        const firebaseProducts: Product[] = snap.docs.map((d) => {
          const data = d.data() as any
          return {
            id: d.id,
            title: data.title || "",
            description: data.description || "",
            price: Number(data.price || 0),
            regularPrice: data.regularPrice ? Number(data.regularPrice) : undefined,
            images: Array.isArray(data.images)
              ? data.images
              : data.images
              ? [data.images]
              : [],
          }
        })

        // 2) merge local + firebase
        // If same ID exists, Firebase overrides static
        const map = new Map<string, Product>()

        LOCAL_PRODUCTS.forEach((p) => map.set(p.id, p))
        firebaseProducts.forEach((p) => map.set(p.id, p))

        const finalList = Array.from(map.values())

        if (!mounted) return
        setProducts(finalList)
      } catch (err) {
        console.error(err)
        setError("Firebase থেকে পণ্য আনা যায়নি। লোকাল পণ্য দেখানো হচ্ছে।")
        setProducts(LOCAL_PRODUCTS)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const shown = products.slice(0, visibleCount)
  const canLoadMore = visibleCount < products.length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">All Products</h1>
            <p className="text-sm text-gray-500">
              {products.length} টি পণ্য
              {error && <span className="ml-2 text-red-500">{error}</span>}
            </p>
          </div>

          <Link
            to="/admin/add-product"
            className="text-sm px-3 py-2 bg-blue-600 text-white rounded"
          >
            Add product
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading…</div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {shown.map((p) => (
                <article
                  key={p.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border"
                >
                  <Link to={`/product/${p.id}`} className="block">
                    <div className="w-full h-44 bg-gray-100 overflow-hidden">
                      <img
                        src={p.images?.[0] || "/placeholder.png"}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  <div className="p-4 flex-1">
                    <h3 className="font-medium text-sm md:text-base">
                      {p.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="mt-3 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          ৳ {Number(p.price).toLocaleString()}
                        </div>
                        {p.regularPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            ৳ {Number(p.regularPrice).toLocaleString()}
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/product/${p.id}`}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                কোনো পণ্য পাওয়া যায়নি।
              </div>
            )}

            {/* Load more */}
            {products.length > 12 && (
              <div className="mt-8 text-center">
                {canLoadMore ? (
                  <button
                    onClick={() => setVisibleCount((v) => v + 12)}
                    className="px-6 py-2 bg-gray-100 rounded"
                  >
                    Load more
                  </button>
                ) : (
                  <button
                    onClick={() => setVisibleCount(12)}
                    className="px-6 py-2 bg-white border rounded"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
