import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { CartProvider } from "./Context/CartContext";
import CartDrawer from "./Components/CartDrawer";

const Home = lazy(() => import("./Pages/Home"));
const About = lazy(() => import("./Pages/About"));
const CategoriesPage = lazy(() => import("./Pages/Categories"));
const ShopPage = lazy(() => import("./Pages/Shop"));
const LoginPage = lazy(() => import("./Pages/Login"));
const DashboardPage = lazy(() => import("./Pages/Dashboard"));
const DashboardProduts = lazy(() => import("./Pages/DashboardProducts"));
const DashboardOrders = lazy(() => import("./Pages/DashboardOrders"));
const DashboardCategories = lazy(() => import("./Pages/DashboardCategories"));
const DashboardBrands = lazy(() => import("./Pages/DashboardBrands"));
const DashboardShipping = lazy(() => import("@/Pages/DashboardShipping"));
const DashboardCustomers = lazy(() => import("./Pages/DashboardCustomers"));
const DashboardContent = lazy(() => import("./Pages/DashboardContent"));
const Settings = lazy(() => import("./Components/Dashboard/Settings"));
const ProductDetailsPage = lazy(() => import("./Pages/ProductDetails"));
const CategoriesDetailsPage = lazy(() => import("./Pages/CategoriesDetails"));
const BrandsDetailsPage = lazy(() => import("./Pages/BrandsDetails"));
const PoliciesPage = lazy(() => import("./Pages/Policies"));
const CartPage = lazy(() => import("./Pages/Cart"));

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const targetId = hash.slice(1)

    if (!targetId) {
      window.scrollTo(0, 0)
      return
    }

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "auto",
        block: "start",
      })
    })
  }, [pathname, hash])

  return null
}

function App() {


  return (
    <>
    <CartProvider>
    <BrowserRouter>
    <ScrollToTop />
    <CartDrawer />
    <Suspense fallback={null}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop/:id" element={<ProductDetailsPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/:name" element={<CategoriesDetailsPage />} />
      <Route path="/brands/:name" element={<BrandsDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/products" element={<DashboardProduts />} />
      <Route path="/dashboard/orders" element={<DashboardOrders />} />
      <Route path="/dashboard/categories" element={<DashboardCategories />} />
      <Route path="/dashboard/brands" element={<DashboardBrands />} />
      <Route path="/dashboard/Shipping" element={<DashboardShipping />} />
      <Route path="/dashboard/customers" element={<DashboardCustomers />} />
      <Route path="/dashboard/content" element={<DashboardContent />} />
      <Route path="/dashboard/settings" element={<Settings />} />
      <Route path="/policies" element={<PoliciesPage />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
    </Suspense>
    </BrowserRouter>
    </CartProvider>
    </>
  )
}

export default App
