import { Plus } from "lucide-react";
import WilayaNode from "../WilayaNode";
import styles from "./styles.module.scss";

const ShippingTree = ({
  provider, provinces, municipalities, zones, offices, assignedMunicipalityIds,
  onAddWilaya, onEditPricing, onEditWilaya, onAddMunicipality,
  onEditMunicipality, onAddOffice, onEditOffice, onToggleZone, onToggleOffice
}) => {
  return <div className={styles.wrap}>
    <div className={styles.head}>
      <div><span className={styles.kicker}>Provider coverage</span><h2>{provider.name}</h2><p>Wilaya coverage, prices and delivery offices.</p></div>
      <button className={styles.add} onClick={onAddWilaya}><Plus size={15}/> Add Wilaya</button>
    </div>

    <div className={styles.tree}>
      {zones.length ? zones.map(zone => {
        const province = provinces.find(p => p.id === zone.province_id);
        if (!province) return null;
        const provinceMunicipalities = municipalities.filter(m => m.province_id === province.id);
        return <WilayaNode key={zone.id} provider={provider} province={province} zone={zone}
          municipalities={provinceMunicipalities.filter((municipality) => assignedMunicipalityIds.includes(municipality.id))}
          offices={offices.filter(o => o.shipping_zone_id === zone.id)}
          onEditPricing={()=>onEditPricing(zone)}
          onEditWilaya={()=>onEditWilaya(zone)}
          onToggleZone={()=>onToggleZone(zone.id)}
          onAddMunicipality={()=>onAddMunicipality(province, zone)}
          onEditMunicipality={(m)=>onEditMunicipality(province,m)}
          onAddOffice={(m)=>onAddOffice(zone,m)}
          onEditOffice={(m,o)=>onEditOffice(zone,m,o)}
          onToggleOffice={onToggleOffice}
        />;
      }) : <div className={styles.empty}>This provider has no Wilaya coverage yet.</div>}
    </div>
  </div>;
};
export default ShippingTree;
