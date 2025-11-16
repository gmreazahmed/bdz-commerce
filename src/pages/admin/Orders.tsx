import React, { useEffect, useMemo, useState } from "react"
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"

function toCsv(rows: any[]) {
  const cols = ["id","productTitle","quantity","name","phone","address","status","createdAt"]
  const header = cols.join(",")
  const lines = rows.map(r => cols.map(c => {
    const v = r[c] ?? ""
    return `"${String(v).replace(/"/g,'""') }"`
  }).join(","))
  return [header,...lines].join("\n")
}

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string,boolean>>({})
  const [busy, setBusy] = useState(false)

  useEffect(()=>{ fetchOrders() },[])

  async function fetchOrders() {
    setBusy(true)
    try {
      const q = query(collection(db,"orders"), orderBy("createdAt","desc"))
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d=>({ id:d.id, ...d.data() })))
    } catch(e){ console.error(e) } finally { setBusy(false) }
  }

  async function confirmOrder(id: string) {
    await updateDoc(doc(db,"orders",id),{ status: "confirmed" })
    setOrders(prev => prev.map(o => o.id===id ? {...o, status:"confirmed"} : o))
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete order?")) return
    await deleteDoc(doc(db,"orders",id))
    setOrders(prev => prev.filter(o=>o.id!==id))
  }

  function toggleSelect(id: string) {
    setSelected(s => ({ ...s, [id]: !s[id]}))
  }

  async function bulkConfirm() {
    const ids = Object.keys(selected).filter(k=>selected[k])
    if (!ids.length) { alert("No orders selected"); return }
    if (!confirm(`Confirm ${ids.length} orders?`)) return
    for (const id of ids) {
      try { await updateDoc(doc(db,"orders",id), { status: "confirmed" }) } catch {}
    }
    fetchOrders()
    setSelected({})
  }

  async function bulkDelete() {
    const ids = Object.keys(selected).filter(k=>selected[k])
    if (!ids.length) { alert("No orders selected"); return }
    if (!confirm(`Delete ${ids.length} orders?`)) return
    for (const id of ids) {
      try { await deleteDoc(doc(db,"orders",id)) } catch {}
    }
    fetchOrders()
    setSelected({})
  }

  function exportCsv() {
    const csv = toCsv(orders)
    const blob = new Blob([csv],{ type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "orders.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedCount = useMemo(()=> Object.values(selected).filter(Boolean).length, [selected])

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="px-3 py-2 bg-gray-100 rounded">Refresh</button>
          <button onClick={exportCsv} className="px-3 py-2 bg-emerald-500 text-white rounded">Export CSV</button>
          <button onClick={bulkConfirm} className="px-3 py-2 bg-blue-600 text-white rounded" disabled={!selectedCount}>Confirm ({selectedCount})</button>
          <button onClick={bulkDelete} className="px-3 py-2 bg-red-600 text-white rounded" disabled={!selectedCount}>Delete ({selectedCount})</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3"><input type="checkbox" onChange={(e)=> {
                const checked = e.target.checked
                const obj: Record<string,boolean> = {}
                orders.forEach(o => obj[o.id] = checked)
                setSelected(obj)
              }} /></th>
              <th className="p-3">Product</th>
              <th className="p-3 w-20">Qty</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Address</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-3"><input checked={!!selected[o.id]} onChange={()=>toggleSelect(o.id)} type="checkbox" /></td>
                <td className="p-3 font-medium">{o.productTitle}<div className="text-xs text-gray-400">{new Date((o.createdAt?.seconds || Date.now()/1000)*1000).toLocaleString()}</div></td>
                <td className="p-3">{o.quantity}</td>
                <td className="p-3">{o.name}</td>
                <td className="p-3">{o.phone}</td>
                <td className="p-3 max-w-xs break-words">{o.address}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3 text-center">
                  {o.status !== "confirmed" && <button onClick={()=>confirmOrder(o.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs mr-2">Confirm</button>}
                  <button onClick={()=>deleteOrder(o.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {orders.length===0 && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
