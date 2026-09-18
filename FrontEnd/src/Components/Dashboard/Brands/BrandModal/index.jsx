import { X } from "lucide-react";

import BrandForm from "../BrandForm";

import styles from "./styles.module.scss";

const BrandModal = ({
  brand,
  onClose,
  onSave
}) => {
  return (
    <div
      className={styles.Modal}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.Modal__Content}>
        <div className={styles.Modal__Header}>
          <div>
            <h2>
              {brand
                ? "Edit Brand"
                : "Add Brand"}
            </h2>

            <p>
              {brand
                ? "Update the brand information."
                : "Create a new product brand."}
            </p>
          </div>

          <button
            className={styles.Modal__Close}
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <BrandForm
          brand={brand}
          onCancel={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
};

export default BrandModal;