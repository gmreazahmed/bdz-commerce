import React, { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../../firebase/firebase"

export default function AddProduct() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [regularPrice, setRegularPrice] = useState<number | "">("")
  const [images, setImages] = useState<string>("") // comma-separated URLs
  const [busy, setBusy] = useState(false)

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!title || !price) return alert("Title & price required")
    setBusy(true)
    try {
      await addDoc(collection(db, "products"), {
        title, description, price: Number(price), regularPrice: regularPrice ? Number(regularPrice) : null,
        images: images.split(",").map(s=>s.trim()).filter(Boolean),
        createdAt: new Date()
      })
      alert("Product added")
      setTitle(""); setDescription(""); setPrice(""); setImages(""); setRegularPrice("")
    } catch (err) {
      console.error(err); alert("Add product failed")
    } finally { setBusy(false) }
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Add Product</h2>
      <form onSubmit={submit} className="grid gap-3 max-w-xl">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="border px-3 py-2 rounded" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="border px-3 py-2 rounded" rows={4} />
        <div className="flex gap-2">
          <input value={price} onChange={e=>setPrice(e.target.value? Number(e.target.value) : "")} placeholder="Price" className="border px-3 py-2 rounded w-1/2" type="number" />
          <input value={regularPrice} onChange={e=>setRegularPrice(e.target.value? Number(e.target.value) : "")} placeholder="Regular price (optional)" className="border px-3 py-2 rounded w-1/2" type="number" />
        </div>
        <input value={images} onChange={e=>setImages(e.target.value)} placeholder="Image URLs (comma separated)" className="border px-3 py-2 rounded" />
        <div className="flex gap-3">
          <button disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded">{busy? "Saving..." : "Add Product"}</button>
          <button type="button" className="px-4 py-2 border rounded" onClick={()=>{ setTitle(""); setDescription(""); setPrice(""); setImages(""); setRegularPrice("") }}>Clear</button>
        </div>
      </form>
    </>
  )
}
