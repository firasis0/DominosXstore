import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/Components/ui/alert-dialog";

import styles from "./styles.module.scss";

const CategoryDeactivateDialog = ({
  category,
  onCancel,
  onConfirm
}) => {
  const affectedProducts =
    category.active_product_count || 0;

  return (
    <AlertDialog
      open={Boolean(category)}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent className={styles.Dialog__Content}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Deactivate Category?
          </AlertDialogTitle>

          <AlertDialogDescription>
            You're about to deactivate{" "}
            <strong>
              "{category.name}"
            </strong>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className={styles.Dialog__Body}>
          <p>
            This category currently has{" "}
            <strong>{affectedProducts}</strong>{" "}
            active{" "}
            {affectedProducts === 1
              ? "product"
              : "products"}
            .
          </p>

          <div className={styles.Dialog__Warning}>
            <strong>
              Deactivating this category will also
              deactivate all {affectedProducts} active{" "}
              {affectedProducts === 1
                ? "product"
                : "products"}{" "}
              under it.
            </strong>
          </div>

          <p>
            These products will no longer appear in
            the storefront until they are activated
            again.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className={styles.Dialog__Danger}
          >
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CategoryDeactivateDialog;