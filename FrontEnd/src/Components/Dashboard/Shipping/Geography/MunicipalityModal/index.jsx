import { useState } from "react";
import styles from "./styles.module.scss";

const MunicipalityModal = ({ province, provinces = [], municipality, onClose, onSave }) => {
  const [name,setName]=useState(municipality?.commune_name||"");
  const [provinceId,setProvinceId]=useState(province?.id || provinces[0]?.id || "");
  const submit=e=>{e.preventDefault();if(!name.trim() || !provinceId)return;onSave({id:municipality?.id,province_id:Number(provinceId),commune_name:name.trim()})};
  return <div className={styles.overlay}><form className={styles.modal} onSubmit={submit}>
    <h2>{municipality?"Edit Municipality":"Add Municipality"}</h2><p>Global geography data used by every shipping provider.</p>
    <label>Wilaya<select value={provinceId} onChange={e=>setProvinceId(e.target.value)} disabled={Boolean(municipality)}><option value="">Select Wilaya</option>{(province ? [province] : provinces).map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label>Municipality name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Boudouaou"/></label>
    <div className={styles.actions}><button type="button" onClick={onClose}>Cancel</button><button className={styles.save}>Save</button></div>
  </form></div>
};
export default MunicipalityModal;
