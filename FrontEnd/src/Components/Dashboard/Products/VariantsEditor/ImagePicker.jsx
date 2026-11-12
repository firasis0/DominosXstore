import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";

import { resolveStoreImageUrl } from "@/lib/storeData";

import styles from "./styles.module.scss";

// Small button that lets the admin choose which product photo belongs to an option value.
export default function ImagePicker({ images, value, onChange }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleClick = (event) => {
            if (!rootRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const choose = (url) => {
        onChange(url);
        setOpen(false);
    };

    return (
        <div className={styles.ImagePicker} ref={rootRef}>
            <button
                type="button"
                className={styles.ImagePicker__Button}
                onClick={() => setOpen((current) => !current)}
                title={
                    images.length === 0
                        ? "Upload product photos first"
                        : "Choose the photo shown for this value"
                }
                disabled={images.length === 0}
                aria-label="Choose photo for this value"
            >
                {value ? (
                    <img src={resolveStoreImageUrl(value)} alt="" />
                ) : (
                    <ImageIcon size={14} />
                )}
            </button>

            {open && (
                <div className={styles.ImagePicker__Popover}>
                    <p>Photo for this value</p>

                    <div className={styles.ImagePicker__Grid}>
                        {images.map((image) => (
                            <button
                                key={image.id}
                                type="button"
                                className={
                                    image.url === value
                                        ? styles.ImagePicker__Active
                                        : undefined
                                }
                                onClick={() => choose(image.url)}
                                aria-label="Use this photo"
                            >
                                <img
                                    src={resolveStoreImageUrl(image.url)}
                                    alt=""
                                />
                            </button>
                        ))}
                    </div>

                    {value && (
                        <button
                            type="button"
                            className={styles.ImagePicker__Clear}
                            onClick={() => choose(null)}
                        >
                            No photo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
