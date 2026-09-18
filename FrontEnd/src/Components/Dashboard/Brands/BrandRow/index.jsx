import { TableCell, TableRow } from "@/Components/ui/table";
import { Switch } from "@/Components/ui/switch";

import styles from "./styles.module.scss";

const BrandRow = ({
  brand,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}) => {

  const handleSwitch = (checked) => {
    if (checked) {
      onActivate(brand);
    } else {
      onDeactivate(brand);
    }
  };

  const HOST_BASE_URL = import.meta.env.VITE_HOST_BASE_URL;

  const canDelete = brand.product_count === 0;

  return (
    <TableRow>

      <TableCell>
        <div className={styles.Row__Brand}>

          <div className={styles.Row__Image}>
            {brand.image_url ? (
              <img
                src={`${HOST_BASE_URL}${brand.image_url}`}
                alt={brand.name}
              />
            ) : (
              <span>
                {brand.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <span className={styles.Row__Name}>
            {brand.name}
          </span>

        </div>
      </TableCell>

      <TableCell>
        <span className={styles.Row__Products}>
          {brand.product_count}
        </span>
      </TableCell>

      <TableCell>
        <div className={styles.Row__Status}>

          <Switch
            checked={brand.is_active}
            onCheckedChange={handleSwitch}
            aria-label={`Toggle ${brand.name}`}
          />

          <span
            className={
              brand.is_active
                ? styles.Row__Active
                : styles.Row__Inactive
            }
          >
            {brand.is_active
              ? "Active"
              : "Inactive"}
          </span>

        </div>
      </TableCell>

      <TableCell>
        <div className={styles.Row__Actions}>

          <button
            className={styles.Row__Edit}
            onClick={() => onEdit(brand)}
          >
            Edit
          </button>

          <button
            className={styles.Row__Delete}
            disabled={!canDelete}
            onClick={() => onDelete(brand)}
          >
            Remove
          </button>

        </div>
      </TableCell>

    </TableRow>
  );
};

export default BrandRow;