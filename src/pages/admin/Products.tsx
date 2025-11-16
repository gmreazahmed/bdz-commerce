import { useEffect, useState } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function loadProducts() {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, "products"))
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setProducts(list)
    } catch (err) {
      console.error(err)
      toast.error("পণ্য লোড করা যায়নি")
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const ok = confirm("আপনি কি নিশ্চিত? প্রোডাক্টটি মুছে যাবে।")
    if (!ok) return

    setDeleting(id)
    try {
      await deleteDoc(doc(db, "products", id))
      toast.success("পণ্য ডিলিট হয়েছে")
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
      toast.error("ডিলিট করা যায়নি")
    }
    setDeleting(null)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 All Products</h1>
        <Link
          to="/admin/add-product"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          ➕ Add Product
        </Link>
      </div>

      {/* Loading State */}
      {loading && <div className="text-gray-500">লোড হচ্ছে...</div>}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          কোন পণ্য নেই — প্রথমে Add Product করুন।
        </div>
      )}

      {/* Products Table */}
      {products.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Title</th>
                <th className="p-3">Price</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={p.images?.[0] || "/no-img.png"}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>

                  <td className="p-3 font-medium">
                    {p.title}
                  </td>

                  <td className="p-3">
                    <span className="font-semibold">৳ {p.price}</span>
                    {p.regularPrice && (
                      <span className="text-xs line-through text-gray-400 ml-1">
                        ৳ {p.regularPrice}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-gray-600">
                    {p.category || "—"}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-3 py-1 border rounded hover:bg-gray-100 text-sm"
                        disabled
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        {deleting === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
