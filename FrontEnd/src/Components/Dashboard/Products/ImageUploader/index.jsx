import { ImagePlus, X } from "lucide-react";

import styles from "./styles.module.scss";

let nextId = 1;

export default function ImageUploader({ images, onChange, inputId }) {
  const handleFiles = (event) => {
    const files = Array.from(event.target.files ?? []);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        onChange((current) => [
          ...current,
          { id: `new-${nextId++}`, url: reader.result },
        ]);
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const removeImage = (id) => {
    onChange((current) => current.filter((image) => image.id !== id));
  };

  return (
    <div className={styles.ImageUploader}>
      {images.map((image) => (
        <div className={styles.ImageUploader__Thumb} key={image.id}>
          <img src={image.url} alt="" />

          <button
            type="button"
            onClick={() => removeImage(image.id)}
            aria-label="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      <label className={styles.ImageUploader__Add} htmlFor={inputId}>
        <ImagePlus size={18} />
        <span>Add photo</span>

        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
        />
      </label>
    </div>
  );
}
