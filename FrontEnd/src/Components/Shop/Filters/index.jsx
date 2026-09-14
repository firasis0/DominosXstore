import styles from "./styles.module.scss";

import { Search } from "lucide-react";

export default function Filters({ filters, categories, brands, onFilterChange }) {
  return (
    <section className={styles.Filters}>
      <div className={styles.Filters__Container}>
        <div className={styles.Filters__Heading}>
          <div className={styles.Filters__Title}>
           
            
          </div>
          
        </div>

        <div className={styles.Filters__Controls}>
          <label className={styles.Filters__Search}>
            <Search size={16} />
            <input
              value={filters.search}
              onChange={(event) => onFilterChange("search", event.target.value)}
              placeholder="Search products"
            />
          </label>

          <select value={filters.category} onChange={(event) => onFilterChange("category", event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>

          <select value={filters.brand} onChange={(event) => onFilterChange("brand", event.target.value)}>
            <option value="">All brands</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) => onFilterChange("minPrice", event.target.value)}
            placeholder="Min price"
            aria-label="Minimum price"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) => onFilterChange("maxPrice", event.target.value)}
            placeholder="Max price"
            aria-label="Maximum price"
          />

          <select value={filters.availability} onChange={(event) => onFilterChange("availability", event.target.value)}>
            <option value="all">All stock</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>

          <select value={filters.sale} onChange={(event) => onFilterChange("sale", event.target.value)}>
            <option value="all">All offers</option>
            <option value="sale">On sale</option>
          </select>

          <select value={filters.sort} onChange={(event) => onFilterChange("sort", event.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>
    </section>
  );
}