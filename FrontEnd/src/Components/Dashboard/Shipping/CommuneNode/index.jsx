import { ChevronDown, ChevronRight, Edit3, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import DeliveryOfficeNode from "../DeliveryOfficeNode";
import styles from "./styles.module.scss";

const CommuneNode = ({ municipality, offices, onEdit, onAddOffice, onEditOffice, onToggleOffice }) => {
  const [open,setOpen]=useState(false);
  return <div className={styles.node}>
    <div className={styles.row}>
      <button className={styles.chevron} onClick={()=>setOpen(v=>!v)}>{open?<ChevronDown size={15}/>:<ChevronRight size={15}/>}</button>
      <MapPin size={14}/>
      <strong>{municipality.commune_name}</strong>
      <span className={styles.count}>{offices.length} offices</span>
      <button className={styles.icon} onClick={onEdit}><Edit3 size={13}/></button>
      <button className={styles.add} onClick={onAddOffice}><Plus size={13}/> Office</button>
    </div>
    {open&&<div className={styles.offices}>{offices.length?offices.map(o=><DeliveryOfficeNode key={o.id} office={o} onEdit={()=>onEditOffice(o)} onToggle={()=>onToggleOffice(o.id)}/>):<span className={styles.noData}>No delivery office.</span>}</div>}
  </div>;
};
export default CommuneNode;
