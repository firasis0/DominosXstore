import { useState } from "react";
import styles from "./styles.module.scss";

const PricingModal = ({ provider, wilaya, zone, onClose, onSave }) => {
  const [officePrice,setOfficePrice]=useState(zone?.office_price??0);
  const [homePrice,setHomePrice]=useState(zone?.home_price??0);
  const submit=e=>{e.preventDefault();onSave({id:zone?.id,provider_id:provider.id,province_id:wilaya.id,office_price:Number(officePrice),home_price:Number(homePrice),is_active:zone?.is_active ?? true})};
  return <div className={styles.overlay}><form className={styles.modal} onSubmit={submit}>
    <h2>Edit Shipping Pricing</h2><p>{provider.name} · {wilaya.name}</p>
    <label>Office price (DA)<input type="number" min="0" value={officePrice} onChange={e=>setOfficePrice(e.target.value)}/></label>
    <label>Home price (DA)<input type="number" min="0" value={homePrice} onChange={e=>setHomePrice(e.target.value)}/></label>
    <div className={styles.actions}><button type="button" onClick={onClose}>Cancel</button><button className={styles.save}>Save</button></div>
  </form></div>
};
export default PricingModal;
