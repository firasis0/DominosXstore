import { ChevronDown, ChevronRight, Edit3, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import CommuneNode from "../CommuneNode";
import styles from "./styles.module.scss";

const WilayaNode = ({ province, zone, municipalities, offices, onEditPricing, onEditWilaya, onToggleZone, onAddMunicipality, onEditMunicipality, onAddOffice, onEditOffice, onToggleOffice }) => {
  const [open, setOpen] = useState(true);
  return <div className={styles.node}>
    <div className={styles.row}>
      <button className={styles.chevron} onClick={()=>setOpen(v=>!v)}>{open?<ChevronDown size={17}/>:<ChevronRight size={17}/>}</button>
      <MapPin size={16}/>
      <div className={styles.name}><strong>{province.name}</strong><span>{municipalities.length} municipalities</span></div>
      <div className={styles.price}><span>Office <b>{zone.office_price} DA</b></span><span>Home <b>{zone.home_price} DA</b></span></div>
      <span className={zone.is_active?styles.active:styles.inactive}>{zone.is_active?"Active":"Inactive"}</span>
      <button className={styles.iconButton} onClick={onEditPricing} title="Edit pricing"><Edit3 size={14}/></button>
      <button className={styles.iconButton} onClick={onEditWilaya} title="Edit Wilaya coverage"><MapPin size={14}/></button>
      <label className={styles.switch} title={zone.is_active ? "Deactivate coverage" : "Activate coverage"}><input type="checkbox" checked={zone.is_active} onChange={onToggleZone}/><span /></label>
    </div>
    {open && <div className={styles.children}>
      <div className={styles.childHead}>
        <div>
          <strong>Municipalities</strong>
          <span>{municipalities.length} configured in this Wilaya</span>
        </div>
        <button className={styles.addMunicipality} onClick={onAddMunicipality}>
          <Plus size={14}/> Add Municipality
        </button>
      </div>
        {municipalities.map(m=><CommuneNode key={m.id} municipality={m} zone={zone} offices={offices.filter(o=>o.municipality_id===m.id)} onEdit={()=>onEditMunicipality(m)} onAddOffice={()=>onAddOffice(m)} onEditOffice={(o)=>onEditOffice(m,o)} onToggleOffice={onToggleOffice}/>)}
      {!municipalities.length&&<div className={styles.noData}>No municipalities in this Wilaya.</div>}
    </div>}
  </div>;
};
export default WilayaNode;
