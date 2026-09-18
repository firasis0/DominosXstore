import { useState } from "react";
import styles from "./styles.module.scss";

const OfficeModal = ({ municipality, office, shippingZoneId, onClose, onSave }) => {
  const [name,setName]=useState(office?.name||"");
  const [address,setAddress]=useState(office?.address||"");
  const submit=e=>{e.preventDefault();if(!name.trim())return;onSave({id:office?.id,shipping_zone_id:shippingZoneId,municipality_id:municipality.id,name:name.trim(),address:address.trim()||null,is_active:office?.is_active ?? true})};
  return <div className={styles.overlay}><form className={styles.modal} onSubmit={submit}>
    <h2>{office?"Edit Delivery Office":"Add Delivery Office"}</h2><p>{municipality.commune_name}</p>
    <label>Office name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Yalidine Boudouaou"/></label>
    <label>Address<textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Centre-ville, Boudouaou"/></label>
    <div className={styles.actions}><button type="button" onClick={onClose}>Cancel</button><button className={styles.save}>Save</button></div>
  </form></div>
};
export default OfficeModal;
