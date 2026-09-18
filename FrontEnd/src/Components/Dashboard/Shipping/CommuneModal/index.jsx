import { useState } from "react";
import styles from "./styles.module.scss";

const CommuneModal = ({ province, municipality, onClose, onSave }) => {
  const [name,setName]=useState(municipality?.commune_name||"");
  const submit=e=>{e.preventDefault();if(!name.trim())return;onSave({id:municipality?.id,province_id:province.id,commune_name:name.trim()})};
  return <div className={styles.overlay}><form className={styles.modal} onSubmit={submit}>
    <h2>{municipality?"Edit Municipality":"Add Municipality"}</h2><p>Wilaya: {province.name}</p>
    <label>Municipality name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Boudouaou"/></label>
    <div className={styles.actions}><button type="button" onClick={onClose}>Cancel</button><button className={styles.save}>Save</button></div>
  </form></div>
};
export default CommuneModal;
