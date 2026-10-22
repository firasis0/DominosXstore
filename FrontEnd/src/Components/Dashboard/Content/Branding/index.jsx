import { useEffect, useState } from "react";
import { Check, ImagePlus, Save } from "lucide-react";

import { useStoreBranding } from "@/Context/StoreBrandingContext";
import { authFetch } from "@/lib/authFetch.js";

import styles from "./styles.module.scss";

export default function Branding() {
    const { name: currentName, logoUrl, updateBranding } =
        useStoreBranding();
    const [name, setName] = useState("");
    const [hasEditedName, setHasEditedName] = useState(false);
    const [logo, setLogo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(
        () => () => {
            if (previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        },
        [previewUrl]
    );

    const displayedName = hasEditedName ? name : currentName;

    const handleLogoChange = (event) => {
        const selectedFile = event.target.files?.[0] || null;
        setLogo(selectedFile);
        setPreviewUrl(
            selectedFile ? URL.createObjectURL(selectedFile) : ""
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();
            formData.append("name", displayedName);

            if (logo) {
                formData.append("logo", logo);
            }

            const response = await authFetch(
                "/dashboard/content/branding",
                {
                    method: "PUT",
                    body: formData,
                }
            );
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Failed to update store branding."
                );
            }

            updateBranding(data.data.branding);
            setLogo(null);
            setPreviewUrl("");
            setName("");
            setHasEditedName(false);
            setSuccess("Store name and logo updated successfully.");
        } catch (requestError) {
            
            setError(
                requestError.message || "Failed to update store branding."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className={styles.Branding}>
            <header className={styles.Branding__Header}>
                <span>STORE IDENTITY</span>
                <h2>Website name &amp; logo</h2>
                <p>
                    Update your store identity in one place. It is used
                    across the storefront, loader, navigation, and order
                    notification emails.
                </p>
            </header>

            {error && (
                <p className={styles.Branding__MessageError} role="alert">
                    {error}
                </p>
            )}
            {success && (
                <p className={styles.Branding__MessageSuccess} role="status">
                    <Check size={16} />
                    {success}
                </p>
            )}

            <form className={styles.Branding__Form} onSubmit={handleSubmit}>
                <label className={styles.Branding__Field}>
                    <span>Website name</span>
                    <input
                        type="text"
                        value={displayedName}
                        onChange={(event) => {
                            setName(event.target.value);
                            setHasEditedName(true);
                        }}
                        maxLength={120}
                        required
                    />
                </label>

                <div className={styles.Branding__Field}>
                    <span>Website logo</span>
                    <label className={styles.Branding__LogoPicker}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            onChange={handleLogoChange}
                        />
                        <ImagePlus size={18} />
                        <span>{logo?.name || "Choose a logo image"}</span>
                    </label>
                    <small>JPG, PNG, WEBP, GIF or AVIF; maximum 5 MB.</small>
                </div>

                <div className={styles.Branding__Preview}>
                    <span>Preview</span>
                    <div>
                        <img
                            src={previewUrl || logoUrl}
                            alt={`${displayedName} logo preview`}
                        />
                        <strong>{displayedName}</strong>
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles.Branding__Save}
                    disabled={saving || !displayedName.trim()}
                >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save branding"}
                </button>
            </form>
        </section>
    );
}
