import { Building2, Map, Package, ShieldCheck, Truck, UserRoundX } from "lucide-react";
import styles from "./styles.module.scss";

const ProviderStats = ({ providers, zones, municipalities, offices }) => {
  const active = providers.filter((item) => item.is_active).length;
  const activeZones = zones.filter((item) => item.is_active).length;
  const activeOffices = offices.filter((item) => item.is_active).length;

  const cards = [
    { label: "Total providers", value: providers.length, icon: Truck },
    { label: "Active providers", value: active, icon: ShieldCheck },
    { label: "Covered Wilayas", value: activeZones, icon: Map },
    { label: "Municipalities", value: municipalities.length, icon: Building2 },
    { label: "Delivery offices", value: activeOffices, icon: Package },
    { label: "Inactive items", value: providers.length - active + zones.length - activeZones + offices.length - activeOffices, icon: UserRoundX },
  ];

  return (
    <div className={styles.grid}>
      {cards.map(({ label, value, icon: Icon }) => (
        <div className={styles.card} key={label}>
          <div className={styles.icon}><Icon size={18} /></div>
          <div><strong>{value}</strong><span>{label}</span></div>
        </div>
      ))}
    </div>
  );
};

export default ProviderStats;
