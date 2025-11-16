import React, { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { auth } from "../../firebase/firebase"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"

export default function AdminLayout() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u)
      if (!u) {
        navigate("/admin") // stay on login
      }
    })
    return () => unsub()
  }, [navigate])

  async function login(e?: React.FormEvent) {
    e?.preventDefault()
    setBusy(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      setUser(cred.user)
      setEmail("")
      setPassword("")
      navigate("/admin/dashboard")
    } catch (err) {
      console.error(err)
      alert("Login failed")
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    await signOut(auth)
    setUser(null)
    navigate("/")
  }

  // Login form when not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Admin Login</h2>
          <form onSubmit={login} className="space-y-3">
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <div className="flex items-center justify-between">
              <button disabled={busy} className="bg-blue-600 text-white px-4 py-2 rounded">
                {busy ? "Logging..." : "Login"}
              </button>
              <button type="button" onClick={() => { setEmail(""); setPassword("") }} className="text-sm text-gray-500">Clear</button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-3">Note: create admin users via Firebase console (no signup here).</p>
        </div>
      </div>
    )
  }

  // When logged in: show layout with sidebar + outlet
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 hidden md:block">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold">Admin Panel</h3>
                <div className="text-xs text-gray-500 mt-1">Signed in as <span className="font-medium">{user.email}</span></div>
              </div>

              <nav className="space-y-2">
                <NavLink to="/admin/dashboard" className={({isActive})=> "block px-3 py-2 rounded " + (isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")}>Dashboard</NavLink>
                <NavLink to="/admin/orders" className={({isActive})=> "block px-3 py-2 rounded " + (isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")}>Orders</NavLink>
                <NavLink to="/admin/products" className={({isActive})=> "block px-3 py-2 rounded " + (isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")}>Products</NavLink>
                <NavLink to="/admin/add-product" className={({isActive})=> "block px-3 py-2 rounded " + (isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")}>Add Product</NavLink>
              </nav>

              <div className="mt-4">
                <button onClick={logout} className="w-full bg-red-600 text-white px-3 py-2 rounded">Logout</button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
