// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { PRODUCTS as LOCAL_PRODUCTS } from "../data/products";
import type { Product } from "../data/products";
import { useEffect, useMemo, useState } from "react";

// hero image (uploaded file path — your infra will serve/transform it)
const heroImg = "/mnt/data/0b7909e4-3e9c-4118-a9f7-de5e06b4b33e.png";

/**
 * Try to fetch products from Firestore and return array of products.
 * If Firestore is not configured / fails, this will throw and caller should fallback.
 */
async function fetchProductsFromFirestore(limitCount = 200): Promise<Product[]> {
  try {
    // dynamic import of firebase modular SDK
    const { getApp, initializeApp } = await import("firebase/app");
    const {
      getFirestore,
      collection,
      getDocs,
      query,
      orderBy,
      limit,
    } = await import("firebase/firestore");

    let app;
    try {
      app = getApp();
    } catch (e) {
      // init from env (Vite)
      const cfg = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      if (!cfg.apiKey || !cfg.projectId) throw new Error("Firebase not configured");
      app = initializeApp(cfg);
    }

    const db = getFirestore(app);
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(limitCount));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title || "",
        description: data.description || "",
        price: Number(data.price || 0),
        regularPrice: data.regularPrice ? Number(data.regularPrice) : undefined,
        images: Array.isArray(data.images) ? data.images : data.images ? [data.images] : [],
        // optional fields
        category: data.category,
      } as Product;
    });
  } catch (err) {
    // bubble up so caller can fallback to local products
    throw err;
  }
}

export default function Home() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // products state will contain merged list (firestore first, then local for missing)
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchProductsFromFirestore(200)
      .then((arr) => {
        if (!mounted) return;
        // merge firestore + local (firestore items take precedence by id)
        const byId = new Map<string, Product>();
        arr.forEach((p) => byId.set(p.id, p));
        LOCAL_PRODUCTS.forEach((p) => {
          if (!byId.has(p.id)) byId.set(p.id, p);
        });
        setProducts(Array.from(byId.values()));
      })
      .catch((err) => {
        // fallback: use local, but show a non-blocking error
        console.warn("Firestore products not available, falling back to local:", err);
        if (mounted) {
          setProducts(LOCAL_PRODUCTS);
          setError("Firestore পাওয়া যাচ্ছে না — লোকাল পণ্য দেখানো হচ্ছে।");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || "").toString().toLowerCase().includes(s) ||
          (p.description || "").toString().toLowerCase().includes(s)
      );
    }
    if (sort === "price-asc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price-desc") list.sort((a, b) => (b.price || 0) - (a.price || 0));
    return list;
  }, [products, q, sort]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-50 to-white border-b">
        <div className="max-w-screen-xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              স্মার্ট হোমে স্বাগতম — <span className="text-blue-600">বাঁচান সময়, বাঁচান বিদ্যুত</span>
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              বাছাইকৃত স্মার্ট গ্যাজেট ও হোম অ্যাক্সেসরিজ — সাশ্রয়ী দামে, দ্রুত ডেলিভারি সহ।
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/all-products"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md"
              >
                সকল প্রোডাক্ট দেখুন
              </Link>

              <Link
                to="/product/prod-001"
                className="inline-flex items-center justify-center border border-gray-300 px-6 py-3 rounded-lg text-gray-700 hover:bg-gray-100 shadow-sm"
              >
                হিট প্রোডাক্ট
              </Link>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 flex items-center bg-white border shadow-sm rounded-lg px-3 py-2">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="প্রোডাক্ট সার্চ করুন..." className="bg-transparent outline-none w-full text-sm" />
                {q && <button onClick={() => setQ("")} className="text-gray-400 text-sm px-2">✕</button>}
              </div>

              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="text-sm rounded-lg border px-4 py-2 bg-white shadow-sm">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>

            {error && <p className="mt-3 text-sm text-yellow-700">{error}</p>}
          </div>

          <div className="flex-1 hidden lg:block">
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img src={heroImg} alt="hero" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">সর্বশেষ পণ্য</h2>
          <div className="text-sm text-gray-500">{filtered.length} টি পণ্য</div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading products…</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p: Product) => (
              <article key={p.id} className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition overflow-hidden">
                <Link to={`/product/${p.id}`} className="block">
                  <div className="w-full h-56 overflow-hidden bg-gray-100">
                    <img src={p.images?.[0] || "/placeholder.png"} alt={p.title} className="w-full h-full object-cover transform hover:scale-105 transition duration-300" />
                  </div>
                </Link>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-base line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{typeof p.description === "string" ? p.description : ""}</p>

                  <div className="mt-3 flex justify-between items-center">
                    <div>
                      <span className="text-lg font-bold text-gray-900">৳ {Number(p.price).toLocaleString()}</span>
                      {p.regularPrice && <p className="text-xs text-gray-400 line-through">৳ {Number(p.regularPrice).toLocaleString()}</p>}
                    </div>

                    <Link to={`/product/${p.id}`} className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow hover:bg-blue-700">Buy</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-500">কোনো পণ্য পাওয়া যায়নি।</div>
        )}
      </section>
    </div>
  );
}
