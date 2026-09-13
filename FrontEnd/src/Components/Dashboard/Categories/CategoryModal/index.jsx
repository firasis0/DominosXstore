import { X } from "lucide-react";

import CategoryForm from "../CategoryForm";

import styles from "./styles.module.scss";

const CategoryModal = ({
  category,
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
              {category
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <p>
              {category
                ? "Update the category information."
                : "Create a new product category."}
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

        <CategoryForm
          category={category}
          onCancel={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
};

export default CategoryModal;