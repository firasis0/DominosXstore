import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";

import styles from "./styles.module.scss";

const resolvePreviewUrl = (value) => {
  if (!value) return "";

  if (/^(blob:|data:|https?:)/.test(value)) {
    return value;
  }

  const hostBaseUrl = import.meta.env.VITE_HOST_BASE_URL;

  return `${hostBaseUrl}${value}`;
};

const BrandImageUploader = ({
  value,
  onChange
}) => {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(
    resolvePreviewUrl(value)
  );

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const url = URL.createObjectURL(file);

    setPreview(url);

    onChange({
      file,
      preview: url
    });
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];

    handleFile(file);
  };

  const removeImage = (event) => {
    event.stopPropagation();

    setPreview("");
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={styles.Uploader}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        hidden
      />

      {preview ? (
        <div className={styles.Uploader__Preview}>
          <img
            src={preview}
            alt="Brand preview"
          />

          <button
            type="button"
            className={styles.Uploader__Remove}
            onClick={removeImage}
          >
            <X size={16} />
          </button>

          <button
            type="button"
            className={styles.Uploader__Replace}
            onClick={() => inputRef.current?.click()}
          >
            Replace image
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.Uploader__Empty}
          onClick={() => inputRef.current?.click()}
        >
          <div className={styles.Uploader__Icon}>
            <ImagePlus size={22} />
          </div>

          <strong>Upload image</strong>

          <span>
            PNG, JPG or WEBP
          </span>
        </button>
      )}
    </div>
  );
};

export default BrandImageUploader;