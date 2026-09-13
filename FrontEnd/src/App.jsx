import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
import DashboardCategories from './Pages/DashboardCategories'
import ProductDetailsPage from "./Pages/ProductDetails";
import CategoriesDetailsPage from './Pages/CategoriesDetails';
import BrandsDetailsPage from './Pages/BrandsDetails';
import PoliciesPage from './Pages/Policies';

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
    {/* the loader : */}
    <Loader />
    {/* ///////////// */}
    <BrowserRouter>
    <ScrollToTop />
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
      <Route path="/dashboard/categories" element={<DashboardCategories />} />
      <Route path="/policies" element={<PoliciesPage />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
