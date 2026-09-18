import { useState } from "react";
import styles from "./styles.module.scss";

const WilayaModal = ({ geographyOnly, provider, provinces, existingZones=[], zone, province, onClose, onSave }) => {
  const [name,setName]=useState(province?.name||"");
  const [provinceId,setProvinceId]=useState(zone?.province_id??"");
  const [officePrice,setOfficePrice]=useState(zone?.office_price??0);
  const [homePrice,setHomePrice]=useState(zone?.home_price??0);

  const submit=e=>{
    e.preventDefault();
    if(geographyOnly){if(!name.trim())return;onSave({name:name.trim()});return;}
    if(!provinceId)return;
    const duplicate=existingZones.some(z=>z.provider_id===provider.id&&z.province_id===Number(provinceId)&&z.id!==zone?.id);
    if(duplicate){alert("This provider already covers this Wilaya.");return;}
    onSave({id:zone?.id,provider_id:provider.id,province_id:Number(provinceId),office_price:Number(officePrice),home_price:Number(homePrice),is_active:zone?.is_active ?? true});
  };

  return <div className={styles.overlay}><form className={styles.modal} onSubmit={submit}>
    <h2>{geographyOnly?(province?"Edit Wilaya":"Add Wilaya"):(zone?"Edit Wilaya Coverage":"Add Wilaya Coverage")}</h2>
    {geographyOnly ? <><div className={styles.notice}>This creates a global Wilaya. Provider coverage is configured separately from the provider Manage screen.</div><label>Wilaya name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Blida"/></label></> :
      <>
        <label>Wilaya<select value={provinceId} onChange={e=>setProvinceId(e.target.value)}><option value="">Select Wilaya</option>{provinces.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <div className={styles.two}><label>Office price<input type="number" min="0" value={officePrice} onChange={e=>setOfficePrice(e.target.value)}/></label><label>Home price<input type="number" min="0" value={homePrice} onChange={e=>setHomePrice(e.target.value)}/></label></div>
      </>
    }
    <div className={styles.actions}><button type="button" onClick={onClose}>Cancel</button><button className={styles.save}>Save</button></div>
  </form></div>
};
export default WilayaModal;
