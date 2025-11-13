// src/App.tsx
import { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import ProductPage from "./pages/ProductPage"
import AdminPage from "./pages/AdminPage"
import { initFacebookPixel } from "./lib/facebook-pixel"

export default function App() {
  const location = useLocation()

  useEffect(() => {
    // init once using env var VITE_FB_PIXEL_ID
    const pixelId = import.meta.env.VITE_FB_PIXEL_ID || ""
    if (pixelId) {
      initFacebookPixel(String(pixelId))
    } else {
      // optional: console.info('No FB Pixel configured')
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
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPage/>} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
