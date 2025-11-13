import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { PRODUCTS } from "../data/products"
import OrderModal from "../components/OrderModal"

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const product = PRODUCTS.find(p => p.id === id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showOrder, setShowOrder] = useState(false)

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <p>Product not found.</p>
        <Link to="/" className="text-blue-600 underline">Back to products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 grid md:grid-cols-2 gap-6">
        <div>
          <div className="w-full h-96 overflow-hidden rounded">
            <img src={product.images[selectedImage]} alt={product.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
          </div>

          <div className="flex gap-3 mt-3">
            {product.images.map((src, i) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-14 rounded overflow-hidden border ${i===selectedImage ? 'ring-2 ring-blue-600' : ''}`}>
                <img src={src} alt={`${product.title}-${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product.title}</h1>

          <div className="mt-4">
            <div className="text-2xl font-bold text-blue-600">৳ {product.price.toLocaleString()}</div>
            {product.regularPrice && <div className="text-sm text-gray-400 line-through">৳ {product.regularPrice.toLocaleString()}</div>}
          </div>

          <div className="mt-6">
            <button onClick={() => setShowOrder(true)} className="bg-blue-600 text-white px-4 py-2 rounded mr-3">Buy Now</button>
            <Link to="/" className="px-4 py-2 border rounded">Back</Link>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">বিস্তারিত</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
        </div>
      </div>

      {showOrder && <OrderModal product={product} onClose={() => setShowOrder(false)} />}
    </div>
  )
}
