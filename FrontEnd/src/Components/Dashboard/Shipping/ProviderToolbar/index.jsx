import { Search } from "lucide-react";
import styles from "./styles.module.scss";

const ProviderToolbar = ({ search, status, onSearch, onStatus }) => (
  <div className={styles.toolbar}>
    <div className={styles.search}>
      <Search size={16} />
      <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search providers..." />
    </div>
    <select value={status} onChange={(e) => onStatus(e.target.value)}>
      <option value="all">All statuses</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>
);

export default ProviderToolbar;
