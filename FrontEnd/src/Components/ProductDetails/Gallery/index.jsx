import { useState } from "react";

import styles from "./styles.module.scss";

export default function Gallery({ product }) {
  const HOST_BASE_URL = import.meta.env.VITE_HOST_BASE_URL;
  const [activeImage, setActiveImage] = useState(0);

  const images = product.images ?? [];

  if (!images.length) {
    return (
      <div className={styles.Gallery}>
        <div className={styles.Gallery__Main}>
          <span>No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.Gallery}>
      <div className={styles.Gallery__Main}>
        <img
          src={`${HOST_BASE_URL}${images[activeImage]}`}
          alt={product.name}
        />
      </div>

      {images.length > 1 && (
        <div className={styles.Gallery__Thumbnails}>
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`${styles.Gallery__Thumbnail} ${
                activeImage === index
                  ? styles.Gallery__ThumbnailActive
                  : ""
              }`}
              onClick={() => setActiveImage(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={`${HOST_BASE_URL}${image}`}
                alt=""
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}