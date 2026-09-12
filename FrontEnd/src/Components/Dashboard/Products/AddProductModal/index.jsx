import { useState } from "react";
import { X } from "lucide-react";

import ProductForm from "../ProductForm";
import styles from "../styles.module.scss";

const emptyValues = () => ({
  name: "",
  description: "",
  price: "",
  discount_price: "",
  category_id: "",
  brand_id: "",
  stock: "",
  is_on_sale: false,
  is_active: true,
  images: [],
  variants: [],
});

export default function AddProductModal({ categoryOptions, brandOptions, onClose, onCreate }) {
  const [values, setValues] = useState(emptyValues);

  const handleCreate = () => {
    onCreate({
      name: values.name,
      description: values.description,
      price: Number(values.price) || 0,
      discount_price: values.discount_price === "" ? null : Number(values.discount_price),
      category_id: Number(values.category_id),
      brand_id: Number(values.brand_id),
      stock: Number(values.stock) || 0,
      is_on_sale: values.is_on_sale,
      is_active: values.is_active,
      images: values.images.map((image) => image.url),
      variants: values.variants,
    });
  };

  return (
    <div className={styles.Products__ModalOverlay} onClick={onClose}>
      <div className={styles.Products__Modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.Products__ModalHeader}>
          <div>
            <span>Catalog</span>
            <h2>Add product</h2>
          </div>

          <button onClick={onClose} aria-label="Close add product dialog">
            <X size={18} />
          </button>
        </div>

        <div className={styles.Products__ModalBody}>
          <ProductForm
            values={values}
            onChange={setValues}
            categoryOptions={categoryOptions}
            brandOptions={brandOptions}
            idPrefix="new-product"
          />
        </div>

        <div className={styles.Products__ModalActions}>
          <button onClick={onClose}>Cancel</button>

          <button className={styles.Products__Save} onClick={handleCreate}>
            Save product
          </button>
        </div>
      </div>
    </div>
  );
}
