import styles from "./styles.module.scss";
import { useEffect, useMemo, useState } from "react";

import Hero from "./Hero";
import Filters from "./Filters";
import ProductGrid from "./ProductGrid";
import { fetchStoreBrands, fetchStoreCategories, fetchStoreProducts } from "@/lib/storeData";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    availability: "all",
    sale: "all",
    sort: "featured",
  });

  useEffect(() => {
    Promise.all([
      fetchStoreProducts(),
      fetchStoreCategories(),
      fetchStoreBrands(),
    ])
      .then(([productData, categoryData, brandData]) => {
        setProducts(productData);
        setCategories(categoryData.filter((category) => category.is_active));
        setBrands(brandData.filter((brand) => brand.is_active));
      })
      .catch((error) => console.error("Error fetching shop data:", error));
  }, []);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const price = Number(product.discount_price ?? product.price);
      const matchesSearch = product.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesCategory = !filters.category || String(product.category_id) === filters.category;
      const matchesBrand = !filters.brand || String(product.brand_id) === filters.brand;
      const matchesMinPrice = !filters.minPrice || price >= Number(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || price <= Number(filters.maxPrice);
      const matchesAvailability = filters.availability === "all"
        || (filters.availability === "in-stock" && product.stock > 0)
        || (filters.availability === "out-of-stock" && product.stock === 0);
      const matchesSale = filters.sale === "all"
        || (filters.sale === "sale" && product.is_on_sale);

      return matchesSearch && matchesCategory && matchesBrand
        && matchesMinPrice && matchesMaxPrice
        && matchesAvailability && matchesSale;
    });

    return [...result].sort((left, right) => {
      if (filters.sort === "price-asc") return Number(left.price) - Number(right.price);
      if (filters.sort === "price-desc") return Number(right.price) - Number(left.price);
      if (filters.sort === "name-asc") return left.name.localeCompare(right.name);
      if (filters.sort === "name-desc") return right.name.localeCompare(left.name);
      return 0;
    });
  }, [products, filters]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className={styles.Shop}>
      <Hero />
      <Filters
        filters={filters}
        categories={categories}
        brands={brands}
        resultCount={filteredProducts.length}
        onFilterChange={updateFilter}
      />
      <ProductGrid products={filteredProducts} />
    </main>
  );
}