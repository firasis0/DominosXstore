import { Search, SlidersHorizontal } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/Components/ui/input-group";
import { Select, SelectItem } from "@/Components/ui/select";

import styles from "./styles.module.scss";

export default function ProductToolbar({
  search,
  setSearch,
  category,
  setCategory,
  brand,
  setBrand,
  status,
  setStatus,
  categories,
  brands,
}) {
  return (
    <div className={styles.ProductToolbar}>
      <InputGroup className={styles.ProductToolbar__Search}>
        <InputGroupAddon>
          <Search size={17} />
        </InputGroupAddon>

        <InputGroupInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
        />
      </InputGroup>

      <div className={styles.ProductToolbar__Filters}>
        <Select
          value={category}
          onValueChange={setCategory}
          className={styles.ProductToolbar__Select}
          aria-label="Filter by category"
        >
          <SelectItem value="">All Categories</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          value={brand}
          onValueChange={setBrand}
          className={styles.ProductToolbar__Select}
          aria-label="Filter by brand"
        >
          <SelectItem value="">All Brands</SelectItem>
          {brands.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          value={status}
          onValueChange={setStatus}
          className={styles.ProductToolbar__Select}
          aria-label="Filter by status"
        >
          <SelectItem value="">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="out-of-stock">Out of stock</SelectItem>
        </Select>

        <button type="button" className={styles.ProductToolbar__FilterButton}>
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
}
