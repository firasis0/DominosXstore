import { AlertTriangle, X } from "lucide-react";

import styles from "./styles.module.scss";

const CategoryDeleteDialog = ({
  category,
  onCancel,
  onConfirm,
}) => {
  if (!category) return null;

  return (
    <div
      className={styles.Dialog}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className={styles.Dialog__Content}>

        <div className={styles.Dialog__Header}>
          <div className={styles.Dialog__Icon}>
            <AlertTriangle size={20} />
          </div>

          <button
            type="button"
            className={styles.Dialog__Close}
            onClick={onCancel}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.Dialog__Body}>
          <h2>Delete category?</h2>

          <p>
            Are you sure you want to permanently delete{" "}
            <strong>{category.name}</strong>?
          </p>

          <p className={styles.Dialog__Warning}>
            This action cannot be undone.
          </p>
        </div>

        <div className={styles.Dialog__Actions}>
          <button
            type="button"
            className={styles.Dialog__Cancel}
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.Dialog__Delete}
            onClick={onConfirm}
          >
            Delete Category
          </button>
        </div>

      </div>
    </div>
  );
};

export default CategoryDeleteDialog;