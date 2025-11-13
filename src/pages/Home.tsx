import { Link } from "react-router-dom"
import { PRODUCTS } from "../data/products"

export default function Home() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map(p => (
          <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
            <div className="h-48 w-full overflow-hidden">
              <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover transition-transform hover:scale-105" loading="lazy" />
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-3">{p.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">৳ {p.price.toLocaleString()}</div>
                  {p.regularPrice && <div className="text-xs text-gray-400 line-through">৳ {p.regularPrice.toLocaleString()}</div>}
                </div>

                <Link to={`/product/${p.id}`} className="bg-blue-600 text-white px-3 py-1 rounded shadow-sm">
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
