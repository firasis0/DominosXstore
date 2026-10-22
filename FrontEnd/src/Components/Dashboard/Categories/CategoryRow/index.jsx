import { TableCell, TableRow } from "@/Components/ui/table";
import { Switch } from "@/Components/ui/switch";
import { resolveStoreImageUrl } from "@/lib/storeData";

import styles from "./styles.module.scss";

const CategoryRow = ({
  category,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}) => {

  const handleSwitch = (checked) => {
    if (checked) {
      onActivate(category);
    } else {
      onDeactivate(category);
    }
  };

  const imageUrl = resolveStoreImageUrl(category.image_url);

  const canDelete = category.product_count === 0;

  return (
    <TableRow>

      <TableCell>
        <div className={styles.Row__Category}>

          <div className={styles.Row__Image}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={category.name}
              />
            ) : (
              <span>
                {category.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <span className={styles.Row__Name}>
            {category.name}
          </span>

        </div>
      </TableCell>

      <TableCell>
        <span className={styles.Row__Products}>
          {category.product_count}
        </span>
      </TableCell>

      <TableCell>
        <div className={styles.Row__Status}>

          <Switch
            checked={category.is_active}
            onCheckedChange={handleSwitch}
            aria-label={`Toggle ${category.name}`}
          />

          <span
            className={
              category.is_active
                ? styles.Row__Active
                : styles.Row__Inactive
            }
          >
            {category.is_active
              ? "Active"
              : "Inactive"}
          </span>

        </div>
      </TableCell>

      <TableCell>
        <div className={styles.Row__Actions}>

          <button
            className={styles.Row__Edit}
            onClick={() => onEdit(category)}
          >
            Edit
          </button>

          <button
            className={styles.Row__Delete}
            disabled={!canDelete}
            onClick={() => onDelete(category)}
          >
            Remove
          </button>

        </div>
      </TableCell>

    </TableRow>
  );
};

export default CategoryRow;