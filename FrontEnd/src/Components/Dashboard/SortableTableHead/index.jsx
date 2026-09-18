import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import styles from "./styles.module.scss";

const SortableTableHead = ({
  label,
  sortKey,
  sortConfig,
  onSort,
  className,
}) => {
  const isActive = sortConfig.key === sortKey;
  const Icon = !isActive
    ? ArrowUpDown
    : sortConfig.direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <th className={`${styles.SortableHead} ${className || ""}`}>
      <button
        type="button"
        className={styles.SortButton}
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
      >
        <span>{label}</span>
        <Icon size={14} aria-hidden="true" />
      </button>
    </th>
  );
};

export default SortableTableHead;
