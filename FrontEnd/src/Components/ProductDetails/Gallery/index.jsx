import { useState } from "react";

import styles from "./styles.module.scss";
import { resolveStoreImageUrl } from "@/lib/storeData";

export default function Gallery({ product, focusImage }) {
  // `manual` remembers a thumbnail click; a new focusImage (variant photo) wins over an older click.
  const [manual, setManual] = useState(null);

  const images = (product.images ?? [])
    .map(resolveStoreImageUrl)
    .filter(Boolean);

  const focusIndex = focusImage
    ? images.indexOf(resolveStoreImageUrl(focusImage))
    : -1;

  const activeImage =
    manual && manual.focus === focusImage
      ? manual.index
      : focusIndex >= 0
        ? focusIndex
        : (manual?.index ?? 0);

  const setActiveImage = (index) => setManual({ index, focus: focusImage });

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
          src={images[activeImage]}
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
                src={image}
                alt=""
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}