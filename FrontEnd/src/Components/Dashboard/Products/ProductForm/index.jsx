import { Switch } from "@/Components/ui/switch";

import ImageUploader from "../ImageUploader";
import VariantsEditor from "../VariantsEditor";
import { startingPrice, totalStock } from "../VariantsEditor/variantsForm";
import styles from "./styles.module.scss";

// Shared field set used by both the "Add product" modal and the row edit panel.
// `values` / `onChange` work like a single piece of form state (see the shape in
// AddProductModal's emptyValues() and ProductRow's toValues()).
export default function ProductForm({ values, onChange, categoryOptions, brandOptions, idPrefix, readOnlyInfo }) {
  const update = (field, value) => onChange({ ...values, [field]: value });

  // Stock and price are calculated from the variants, the admin cannot type them.
  const stockTotal = totalStock(values.skus);
  const fromPrice = startingPrice(values.skus, values.is_on_sale);

  // Removing a photo also clears it from the option values that used it.
  const updateImages = (updater) => {
    const images = updater(values.images);
    const urls = new Set(images.map((image) => image.url));

    onChange({
      ...values,
      images,
      options: values.options.map((option) => ({
        ...option,
        values: option.values.map((item) =>
          item.image_url && !urls.has(item.image_url) ? { ...item, image_url: null } : item
        ),
      })),
    });
  };

  return (
    <div className={styles.ProductForm}>
      <div className={styles.ProductForm__Field}>
        <span>Photos</span>
        <ImageUploader
          images={values.images}
          onChange={updateImages}
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
          Total stock
          <input
            className={styles.ProductForm__Locked}
            value={stockTotal}
            readOnly
            tabIndex={-1}
            title="Calculated from the stock of each variant"
          />
        </label>

        <label>
          Starting price (DA)
          <input
            className={styles.ProductForm__Locked}
            value={fromPrice === null ? "—" : fromPrice}
            readOnly
            tabIndex={-1}
            title="The cheapest variant that is in stock"
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
        <VariantsEditor
          options={values.options}
          skus={values.skus}
          images={values.images}
          isOnSale={values.is_on_sale}
          onChange={({ options, skus }) => onChange({ ...values, options, skus })}
        />
      </div>
    </div>
  );
}
