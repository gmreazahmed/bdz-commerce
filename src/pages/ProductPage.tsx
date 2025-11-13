import { useState } from "react"
import { useParams } from "react-router-dom"
import { PRODUCTS } from "../data/products"
import OrderModal from "../components/OrderModal"

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const product = PRODUCTS.find((p) => p.id === id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showOrder, setShowOrder] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg">Product not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* LEFT IMAGE */}
          <div>
            <div
              className="w-full h-[360px] md:h-[440px] bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={product.images[selectedImage]}
                className="w-full h-full object-cover transition duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* thumbnails */}
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-12 rounded-md overflow-hidden border ${
                    selectedImage === i ? "ring-2 ring-blue-600" : "border-gray-200"
                  }`}
                >
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{product.title}</h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="text-2xl font-bold text-blue-600">৳ {product.price.toLocaleString()}</div>
              {product.regularPrice && (
                <div className="text-sm line-through text-gray-400">
                  ৳ {product.regularPrice.toLocaleString()}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowOrder(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow mt-4 text-sm font-medium"
            >
              🛒 Buy Now
            </button>

            {/* description */}
            <div id="product-description" className="mt-5 text-gray-700 text-sm leading-relaxed">
              <h3 className="font-semibold text-base mb-1.5">বিস্তারিত</h3>
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              ডেলিভারি: ঢাকার মধ্যে ৮০৳, বাইরে ১২০৳
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrder && <OrderModal product={product} onClose={() => setShowOrder(false)} />}

      {/* IMAGE LIGHTBOX */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button className="absolute top-5 right-5 text-white text-2xl">✕</button>
          <img
            src={product.images[selectedImage]}
            className="max-w-[90%] max-h-[90%] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
