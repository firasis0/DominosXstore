import { Edit3, Plus, Trash2 } from "lucide-react";
import styles from "./styles.module.scss";

const MunicipalityList = ({
  municipalities,
  onAdd,
  onEdit,
  onRemove,
  province,
}) => {
  return (
    <div className={styles.list}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <strong>Municipalities</strong>

          <span>
            {municipalities.length}{" "}
            {municipalities.length === 1
              ? "municipality"
              : "municipalities"}
          </span>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => onAdd(province)}
        >
          <Plus size={14} />
          <span>Add Municipality</span>
        </button>
      </div>

      {/* Municipality list */}
      <div className={styles.items}>
        {municipalities.length === 0 ? (
          <div className={styles.empty}>
            <span>No municipalities registered under this Wilaya.</span>

            <button
              type="button"
              className={styles.emptyAdd}
              onClick={() => onAdd(province)}
            >
              <Plus size={14} />
              Add Municipality
            </button>
          </div>
        ) : (
          municipalities.map((municipality) => (
            <div
              className={styles.row}
              key={municipality.id}
            >
              <div className={styles.municipalityInfo}>
                <span className={styles.name}>
                  {municipality.commune_name}
                </span>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() =>
                    onEdit(province, municipality)
                  }
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() =>
                    onRemove(province, municipality)
                  }
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MunicipalityList;