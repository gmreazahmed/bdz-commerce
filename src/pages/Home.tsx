// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { PRODUCTS as LOCAL_PRODUCTS } from "../data/products";
import type { Product } from "../data/products";
import { useEffect, useMemo, useState } from "react";
import heroImg from "../assets/hero.jpg";

/** Firestore fetch (same behavior — throws if not configured) */
async function fetchProductsFromFirestore(limitCount = 200): Promise<Product[]> {
  try {
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
        category: data.category,
      } as Product;
    });
  } catch (err) {
    throw err;
  }
}

/** Utility: short text */
function excerpt(s?: string, n = 110) {
  if (!s) return "";
  const t = s.replace(/\n+/g, " ").trim();
  return t.length > n ? t.slice(0, n).trim() + "…" : t;
}

export default function Home() {
  // product controls (search/filter live in products section)
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [category, setCategory] = useState<string | "all">("all");

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
        const byId = new Map<string, Product>();
        arr.forEach((p) => byId.set(p.id, p));
        LOCAL_PRODUCTS.forEach((p) => {
          if (!byId.has(p.id)) byId.set(p.id, p);
        });
        setProducts(Array.from(byId.values()));
      })
      .catch((err) => {
        console.warn("Firestore products unavailable — falling back to local", err);
        if (mounted) {
          setProducts(LOCAL_PRODUCTS);
          setError("লিভস্টোর/ফায়ারবেস পাওয়া যায়নি — লোকাল পণ্য দেখানো হচ্ছে।");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
      {/* show fetch error if any */}
      {error && (
        <div className="max-w-screen-xl mx-auto px-6 py-3">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-yellow-700 rounded">
            {error}
          </div>
        </div>
      )}


    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(String(p.category));
    });
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.slice();

    if (category !== "all") list = list.filter((p) => String(p.category) === category);

    if (query.trim()) {
      const s = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.title || "").toString().toLowerCase().includes(s) ||
          (p.description || "").toString().toLowerCase().includes(s)
      );
    }

    if (sort === "price-asc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price-desc") list.sort((a, b) => (b.price || 0) - (a.price || 0));

    return list;
  }, [products, query, sort, category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-white px-3 py-1 rounded-full text-sm text-blue-700 w-max shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2v6"/><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M5 11h14"/><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 22v-6"/></svg>
              জনপ্রিয় — ট্রাস্টেড গ্যাজেট
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              স্মার্ট হোমের উন্নত্‌ অভিজ্ঞতা — <span className="text-indigo-600">কম খরচে</span>
            </h1>

            <p className="text-gray-600 max-w-2xl">
              শক্তি সাশ্রয়ী ডিভাইস, নিরাপদ কনফিগারেশন এবং ব্যবহার বান্ধব ইন্টারফেস — আপনার ঘরকে করে তুলুন স্মার্ট, সহজ ও আরামদায়ক।
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              <Link to="/all-products" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg shadow-md font-medium">
                সকল প্রোডাক্ট দেখুন
              </Link>

              <Link to="/offers" className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                আজকের ডিল
              </Link>
            </div>

            <div className="mt-6">
              <ul className="flex flex-wrap gap-2 text-xs">
                <li className="px-3 py-1 bg-white rounded-full text-gray-700 shadow-sm">Free shipping 500৳+</li>
                <li className="px-3 py-1 bg-white rounded-full text-gray-700 shadow-sm">30-day returns</li>
                <li className="px-3 py-1 bg-white rounded-full text-gray-700 shadow-sm">Secure checkout</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-end">
            <div className="rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg transform hover:scale-[1.01] transition">
              <img src={heroImg} alt="hero" className="w-full h-96 object-cover" loading="lazy" />
              <div className="p-4 bg-gradient-to-t from-black/30 to-transparent text-white">
                <div className="text-sm font-semibold">Limited collection</div>
                <div className="text-xs mt-1">বাছাইকৃত ভালো পণ্য, সীমিত স্টকে</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PRODUCTS */}
      <main className="max-w-screen-xl mx-auto px-6 py-12">
        {/* heading + controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">সর্বশেষ পণ্য</h2>
            <div className="text-sm text-gray-500 mt-1">{filtered.length} টি পণ্য পাওয়া গেছে</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="প্রোডাক্ট নাম/বর্ণনা দিয়ে সার্চ করুন..."
                className="pl-10 pr-3 py-2 rounded-lg border bg-white shadow-sm w-64 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                aria-label="Search products"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>

            <div className="text-sm text-gray-600 hidden sm:block">Category:</div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c as any)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    category === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="ml-2 text-sm rounded-lg border px-3 py-2 bg-white shadow-sm"
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* product grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading products…</div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <article key={p.id} className="relative bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition">
                  <div className="relative">
                    <Link to={`/product/${p.id}`} state={{ product: p }} className="block">
                      <div className="w-full h-56 bg-gray-100 overflow-hidden">
                        <img
                          src={p.images?.[0] || "/placeholder.png"}
                          alt={p.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                      </div>
                    </Link>

                    {/* price badge */}
                    <div className="absolute right-3 top-3 bg-white/90 px-3 py-1 rounded-full text-sm font-semibold text-indigo-700 shadow-sm">
                      ৳ {Number(p.price).toLocaleString()}
                    </div>

                    {/* quick actions overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-end justify-center opacity-0 group-hover:opacity-100">
                      <div className="mb-4 flex gap-2">
                        <Link to={`/product/${p.id}`} state={{ product: p }} className="bg-white px-3 py-2 rounded-lg text-sm font-medium shadow hover:bg-gray-100">View</Link>
                        <button className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700">Add</button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">{excerpt(p.description, 120)}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        {p.regularPrice && <div className="text-xs text-gray-400 line-through">৳ {Number(p.regularPrice).toLocaleString()}</div>}
                        <div className="text-sm text-gray-700">{p.category ?? ""}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500">Rating</div>
                        <div className="text-xs text-gray-400">⭐⭐⭐⭐☆</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-500">কোনো পণ্য পাওয়া যায়নি।</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
