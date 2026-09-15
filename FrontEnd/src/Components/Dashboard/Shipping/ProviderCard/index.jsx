import { Edit3, MapPin, MoreVertical, Power, Truck } from "lucide-react";
import styles from "./styles.module.scss";

const ProviderCard = ({ provider, zones, municipalities, offices, onManage, onEdit, onToggle }) => {
  const providerZones = zones.filter((item) => item.provider_id === provider.id);
  const providerMunicipalities = municipalities.filter((municipality) =>
    providerZones.some((zone) => zone.province_id === municipality.province_id)
  );
  const providerOffices = offices.filter((office) =>
    providerZones.some((zone) => zone.id === office.shipping_zone_id)
  );

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.logo}>
          {provider.logo_url ? <img src={provider.logo_url} alt="" /> : <Truck size={21} />}
        </div>
        <span className={provider.is_active ? styles.active : styles.inactive}>
          {provider.is_active ? "Active" : "Inactive"}
        </span>
        <label className={styles.switch} title={provider.is_active ? "Deactivate provider" : "Activate provider"}>
          <input type="checkbox" checked={provider.is_active} onChange={onToggle} />
          <span />
        </label>
        <span className={styles.more}><MoreVertical size={17}/></span>
      </div>

      <h3>{provider.name}</h3>
      <div className={styles.metrics}>
        <span><MapPin size={14}/>{providerZones.length} Wilayas</span>
        <span><MapPin size={14}/>{providerMunicipalities.length} Municipalities</span>
        <span><Power size={14}/>{providerOffices.length} Offices</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.secondary} onClick={onEdit}><Edit3 size={14}/> Edit</button>
        <button className={styles.primary} onClick={onManage}>Manage</button>
      </div>
    </article>
  );
};

export default ProviderCard;
