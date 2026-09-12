import { Switch } from "@/Components/ui/switch";

import ImageUploader from "../ImageUploader";
import VariantsEditor from "../VariantsEditor";
import styles from "./styles.module.scss";

// Shared field set used by both the "Add product" modal and the row edit panel.
// `values` / `onChange` work like a single piece of form state (see the shape in
// AddProductModal's emptyValues() and ProductRow's toValues()).
export default function ProductForm({ values, onChange, categoryOptions, brandOptions, idPrefix, readOnlyInfo }) {
  const update = (field, value) => onChange({ ...values, [field]: value });

  return (
    <div className={styles.ProductForm}>
      <div className={styles.ProductForm__Field}>
        <span>Photos</span>
        <ImageUploader
          images={values.images}
          onChange={(updater) => update("images", updater(values.images))}
          inputId={`${idPrefix}-images`}
        />
      </div>

      <div className={styles.ProductForm__Grid}>
        <label>
          Product name
          <input
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Wireless gaming mouse"
          />
        </label>

        <label>
          Brand
          <select value={values.brand_id} onChange={(event) => update("brand_id", event.target.value)}>
            <option value="" disabled>
              Select brand
            </option>
            {brandOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={values.category_id} onChange={(event) => update("category_id", event.target.value)}>
            <option value="" disabled>
              Select category
            </option>
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Stock
          <input
            type="number"
            min="0"
            value={values.stock}
            onChange={(event) => update("stock", event.target.value)}
          />
        </label>

        <label>
          Price (DA)
          <input
            type="number"
            min="0"
            value={values.price}
            onChange={(event) => update("price", event.target.value)}
          />
        </label>

        <label>
          Discount price (DA)
          <input
            type="number"
            min="0"
            placeholder="No discount"
            value={values.discount_price}
            onChange={(event) => update("discount_price", event.target.value)}
          />
        </label>

        <label className={styles.ProductForm__Switch}>
          On sale
          <Switch
            checked={values.is_on_sale}
            onCheckedChange={(checked) => update("is_on_sale", checked)}
            aria-label="Toggle on sale"
          />
        </label>

        <label className={styles.ProductForm__Switch}>
          Active
          <Switch
            checked={values.is_active}
            onCheckedChange={(checked) => update("is_active", checked)}
            aria-label="Toggle active"
          />
        </label>

        {readOnlyInfo && (
          <label className={styles.ProductForm__ReadOnly}>
            SKU / created
            <span>{readOnlyInfo}</span>
          </label>
        )}

        <label className={styles.ProductForm__Description}>
          Description
          <textarea
            rows={3}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Short product description..."
          />
        </label>
      </div>

      <div className={styles.ProductForm__Field}>
        <span>Variants</span>
        <VariantsEditor variants={values.variants} onChange={(variants) => update("variants", variants)} />
      </div>
    </div>
  );
}
