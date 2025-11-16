// src/App.tsx
import { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import ProductPage from "./pages/ProductPage"
import { initFacebookPixel } from "./lib/facebook-pixel"

// admin pages / layout
import AdminLayout from "./pages/admin/AdminLayout"
import Dashboard from "./pages/admin/Dashboard"
import Orders from "./pages/admin/Orders"
import AddProduct from "./pages/admin/AddProduct"
import Products from "./pages/admin/Products"
// (optional) admin products management page


export default function App() {
  const location = useLocation()

  useEffect(() => {
    // init once using env var VITE_FB_PIXEL_ID
    const pixelId = import.meta.env.VITE_FB_PIXEL_ID || ""
    if (pixelId) {
      initFacebookPixel(String(pixelId))
    }
  }, [])

  useEffect(() => {
    // track pageview on route change (if fbq loaded)
    try {
      // @ts-ignore
      if (typeof window !== "undefined" && (window as any).fbq) {
        ;(window as any).fbq("track", "PageView")
      }
    } catch (e) {
      // ignore
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />

          {/* nested admin routes under /admin using AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="/admin/products" element={<Products />} />
          </Route>

          {/* fallback: optional 404 route */}
          <Route path="*" element={<div className="p-12 text-center">404 — Page not found</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
