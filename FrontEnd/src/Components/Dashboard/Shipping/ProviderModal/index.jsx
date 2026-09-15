import { useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import styles from "./styles.module.scss";

const ProviderModal = ({ provider, onClose, onSave }) => {
  const [name, setName] = useState(provider?.name || "");
  const [logo, setLogo] = useState(provider?.logo_url || null);
  const [logoFile, setLogoFile] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setLogoFile(file);
    setLogo(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoFile(null);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      logo_url: logo,
      logo_file: logoFile,
      is_active: provider?.is_active ?? true,
    });
  };

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className={styles.modal} onSubmit={submit}>
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>Shipping providers</span>
            <h2>{provider ? "Edit Provider" : "Add Provider"}</h2>
            <p>Configure the courier company and its brand identity.</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose}>×</button>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Provider information</div>
          <label>
            Provider name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Yalidine"
              autoFocus
            />
          </label>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Provider logo</div>
          <div className={styles.uploadBox}>
            {logo ? (
              <div className={styles.preview}>
                <img src={logo} alt="Provider logo preview" />
                <div>
                  <strong>{logoFile?.name || "Current provider logo"}</strong>
                  <span>{logoFile ? `${(logoFile.size / 1024 / 1024).toFixed(2)} MB` : "Existing image"}</span>
                </div>
                <button type="button" onClick={removeLogo} title="Remove logo">
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <label className={styles.dropzone}>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFile} />
                <span className={styles.uploadIcon}><ImagePlus size={21} /></span>
                <strong>Upload provider logo</strong>
                <span>PNG, JPG, WEBP or SVG · max 5 MB</span>
                <em><Upload size={13} /> Choose image</em>
              </label>
            )}
          </div>
          {logo && (
            <label className={styles.changeFile}>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFile} />
              Change image
            </label>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button className={styles.save}>Save provider</button>
        </div>
      </form>
    </div>
  );
};

export default ProviderModal;
