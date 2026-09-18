import { Edit3, MapPin } from "lucide-react";
import styles from "./styles.module.scss";

const DeliveryOfficeNode = ({ office, onEdit, onToggle }) => (
  <div className={styles.row}>
    <MapPin size={12}/>
    <div className={styles.info}><strong>{office.name}</strong><span>{office.address || "No address"}</span></div>
    <span className={office.is_active?styles.active:styles.inactive}>{office.is_active?"Active":"Inactive"}</span>
    <button className={styles.edit} onClick={onEdit}><Edit3 size={12}/></button>
    <label className={styles.switch} title={office.is_active ? "Deactivate office" : "Activate office"}><input type="checkbox" checked={office.is_active} onChange={onToggle}/><span /></label>
  </div>
);
export default DeliveryOfficeNode;
