import { useState } from "react";
import styles from "./styles.module.scss";

const MunicipalityPickerModal = ({ province, municipalities, onClose, onSave }) => {
  const [municipalityId, setMunicipalityId] = useState(municipalities[0]?.id || "");

  const submit = (event) => {
    event.preventDefault();
    const municipality = municipalities.find((item) => item.id === Number(municipalityId));
    if (municipality) onSave(municipality);
  };

  return (
    <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className={styles.modal} onSubmit={submit}>
        <span className={styles.kicker}>Provider coverage</span>
        <h2>Add Municipality</h2>
        <p>Select an existing municipality from {province.name}. Geography is managed globally.</p>
        {municipalities.length ? (
          <label>
            Available municipality
            <select value={municipalityId} onChange={(event) => setMunicipalityId(event.target.value)} autoFocus>
              {municipalities.map((municipality) => <option key={municipality.id} value={municipality.id}>{municipality.commune_name}</option>)}
            </select>
          </label>
        ) : <div className={styles.empty}>All municipalities in this Wilaya are already assigned.</div>}
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button className={styles.save} disabled={!municipalities.length}>Add municipality</button>
        </div>
      </form>
    </div>
  );
};

export default MunicipalityPickerModal;
