import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./Context/CartContext";
import CartDrawer from "./Components/CartDrawer";
//components:
import Loader from "./Components/Loader";
//Pages:
import Home from './Pages/Home'
import About from './Pages/About';
import CategoriesPage from "./Pages/Categories";
import ShopPage from "./Pages/Shop";
import LoginPage from "./Pages/Login";
import DashboardPage from "./Pages/Dashboard";
import DashboardProduts from './Pages/DashboardProducts';
import DashboardOrders from './Pages/DashboardOrders';
import DashboardCategories from './Pages/DashboardCategories'
import DashboardBrands from './Pages/DashboardBrands'
import DashboardShipping from "@/Pages/DashboardShipping";
import DashboardCustomers from './Pages/DashboardCustomers';
import DashboardContent from "./Pages/DashboardContent";
import Settings from "./Components/Dashboard/Settings";
import ProductDetailsPage from "./Pages/ProductDetails";
import CategoriesDetailsPage from './Pages/CategoriesDetails';
import BrandsDetailsPage from './Pages/BrandsDetails';
import PoliciesPage from './Pages/Policies';
import CartPage from './Pages/Cart';

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
    {/* the loader : */}
    <Loader />
    {/* ///////////// */}
    <BrowserRouter>
    <ScrollToTop />
    <CartDrawer />
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
    </BrowserRouter>
    </CartProvider>
    </>
  )
}

export default App
