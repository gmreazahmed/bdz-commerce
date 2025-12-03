import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import OrderModal from "../components/OrderModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  regularPrice?: number | null;
  images: string[];
  category?: string;
  createdAt?: any;
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateProduct = (location.state as any)?.product as Product | undefined;

  const [product, setProduct] = useState<Product | null>(stateProduct ?? null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showOrder, setShowOrder] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [loading, setLoading] = useState<boolean>(!stateProduct);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchIfNeeded() {
      if (!id) {
        if (mounted) {
          setError("Invalid product id");
          setLoading(false);
        }
        return;
      }

      // If product already set from state or local, do nothing
      if (product) {
        setLoading(false);
        return;
      }

      // 1) try local PRODUCTS
      const local = PRODUCTS.find((p) => p.id === id);
      if (local) {
        if (mounted) {
          setProduct(local);
          setLoading(false);
        }
        return;
      }

      // 2) fallback: fetch from Firestore
      setLoading(true);
      try {
        const dref = doc(db, "products", id);
        const snap = await getDoc(dref);

        if (!snap.exists()) {
          if (mounted) {
            setError("Product not found");
            setLoading(false);
          }
          return;
        }

        const data = snap.data() as any;
        const p: Product = {
          id: snap.id,
          title: data.title || "",
          description: data.description || "",
          price: Number(data.price || 0),
          regularPrice: data.regularPrice != null ? Number(data.regularPrice) : null,
          images: Array.isArray(data.images) ? data.images : data.images ? [data.images] : [],
          category: data.category,
          createdAt: data.createdAt,
        };

        if (mounted) {
          setProduct(p);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Failed to load product");
          setLoading(false);
        }
      }
    }

    fetchIfNeeded();
    return () => {
      mounted = false;
    };
    // intentionally include id only; product in state is checked inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // loading / error UI
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg text-gray-600">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg text-red-500">{error}</p>
          <Link to="/all-products" className="mt-4 inline-block text-blue-600">← Back to products</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg">Product not found.</p>
          <Link to="/all-products" className="mt-4 inline-block text-blue-600">← Back to products</Link>
        </div>
      </div>
    );
  }

  // friendly createdAt formatting if it's a Firestore Timestamp
  const createdAt =
    product.createdAt && typeof product.createdAt === "object" && (product.createdAt as any).toDate
      ? (product.createdAt as any).toDate().toLocaleString()
      : product.createdAt instanceof Date
      ? (product.createdAt as Date).toLocaleString()
      : null;

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
                src={product.images[selectedImage] || "/placeholder.png"}
                className="w-full h-full object-cover transition duration-300 hover:scale-105"
                loading="lazy"
                alt={product.title}
              />
            </div>

            {/* thumbnails */}
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {(product.images && product.images.length > 0 ? product.images : ["/placeholder.png"]).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-12 rounded-md overflow-hidden border ${selectedImage === i ? "ring-2 ring-blue-600" : "border-gray-200"}`}
                >
                  <img src={src} className="w-full h-full object-cover" alt={`${product.title}-${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{product.title}</h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="text-2xl font-bold text-blue-600">৳ {Number(product.price).toLocaleString()}</div>
              {product.regularPrice && (
                <div className="text-sm line-through text-gray-400">৳ {Number(product.regularPrice).toLocaleString()}</div>
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

            {createdAt && <div className="mt-2 text-xs text-gray-400">Added: {createdAt}</div>}
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
            src={product.images[selectedImage] || "/placeholder.png"}
            className="max-w-[90%] max-h-[90%] object-contain"
            onClick={(e) => e.stopPropagation()}
            alt={product.title}
          />
        </div>
      )}
    </div>
  );
}
