import { useState } from "react";

import {
  ImagePlus,
  Trash2,
  Upload,
  LoaderCircle,
} from "lucide-react";

import styles from "./styles.module.scss";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getServerBaseUrl = () => {
  return API_BASE_URL.replace(/\/api\/?$/, "");
};

const getImageUrl = (url) => {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `${getServerBaseUrl()}${url}`;
};

const ProviderModal = ({
  provider,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(
    provider?.name || ""
  );

  const [logo, setLogo] = useState(
    provider?.logo_url || null
  );

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  /**
   * Upload one provider logo to the backend.
   * The backend returns the permanent /uploads/... URL.
   */
  const uploadImage = async (file) => {
    const formData = new FormData();

    formData.append("logo", file);

    const response = await fetch(
      `${API_BASE_URL}/dashboard/shipping/providers/logo`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Failed to upload provider logo."
      );
    }

    return result.data.url;
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError(
        "Only image files are allowed."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(
        "Image size must not exceed 5 MB."
      );

      e.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const uploadedUrl = await uploadImage(file);

      setLogo(uploadedUrl);
    } catch (error) {
      console.error(
        "Error uploading provider logo:",
        error
      );

      setUploadError(
        error.message ||
          "Unable to upload provider logo."
      );
    } finally {
      setUploading(false);

      e.target.value = "";
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

  const submit = (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      logo_url: logo,
      is_active:
        provider?.is_active ?? true,
    });
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <form
        className={styles.modal}
        onSubmit={submit}
      >
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>
              Shipping providers
            </span>

            <h2>
              {provider
                ? "Edit Provider"
                : "Add Provider"}
            </h2>

            <p>
              Configure the courier company and its
              brand identity.
            </p>
          </div>

          <button
            type="button"
            className={styles.close}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Provider information
          </div>

          <label>
            Provider name

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Yalidine"
              autoFocus
            />
          </label>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Provider logo
          </div>

          <div className={styles.uploadBox}>
            {logo ? (
              <div className={styles.preview}>
                <img
                  src={getImageUrl(logo)}
                  alt="Provider logo preview"
                />

                <div>
                  <strong>
                    Provider logo
                  </strong>

                  <span>
                    {uploading
                      ? "Uploading..."
                      : "Uploaded image"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={removeLogo}
                  title="Remove logo"
                  disabled={uploading}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <label className={styles.dropzone}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFile}
                  disabled={uploading}
                />

                {uploading ? (
                  <LoaderCircle
                    size={21}
                    className={styles.spinner}
                  />
                ) : (
                  <span
                    className={styles.uploadIcon}
                  >
                    <ImagePlus size={21} />
                  </span>
                )}

                <strong>
                  {uploading
                    ? "Uploading..."
                    : "Upload provider logo"}
                </strong>

                <span>
                  PNG, JPG, WEBP or SVG · max 5 MB
                </span>

                <em>
                  <Upload size={13} />

                  {uploading
                    ? "Uploading"
                    : "Choose image"}
                </em>
              </label>
            )}
          </div>

          {logo && !uploading && (
            <label
              className={styles.changeFile}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFile}
                disabled={uploading}
              />

              Change image
            </label>
          )}

          {uploadError && (
            <p className={styles.error}>
              {uploadError}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>

          <button
            className={styles.save}
            type="submit"
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "Save provider"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProviderModal;

