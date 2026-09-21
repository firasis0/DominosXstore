import { useState } from "react";
import { ImagePlus, X, LoaderCircle } from "lucide-react";

import styles from "./styles.module.scss";
import { authFetch } from "../../../../lib/authFetch";

let nextId = 1;

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

export default function ImageUploader({
    images,
    onChange,
    inputId,
}) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const handleFiles = async (event) => {
        const files = Array.from(
            event.target.files ?? []
        );

        if (files.length === 0) {
            return;
        }

        setUploadError("");
        setUploading(true);

        try {
            const formData = new FormData();

            files.forEach((file) => {
                formData.append("images", file);
            });

            const response = await authFetch(
                "/dashboard/products/images",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Failed to upload images"
                );
            }

            const uploadedImages =
                result.data.map((image) => ({
                    id: `new-${nextId++}`,
                    url: image.url,
                }));

            onChange((current) => [
                ...current,
                ...uploadedImages,
            ]);
        } catch (error) {
            console.error(
                "Error uploading images:",
                error
            );

            setUploadError(
                error.message ||
                    "Unable to upload images."
            );
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const removeImage = (id) => {
        onChange((current) =>
            current.filter(
                (image) => image.id !== id
            )
        );
    };

    return (
        <div className={styles.ImageUploader}>
            {images.map((image) => (
                <div
                    className={
                        styles.ImageUploader__Thumb
                    }
                    key={image.id}
                >
                    <img
                        src={getImageUrl(image.url)}
                        alt=""
                    />

                    <button
                        type="button"
                        onClick={() =>
                            removeImage(image.id)
                        }
                        aria-label="Remove image"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}

            <label
                className={
                    styles.ImageUploader__Add
                }
                htmlFor={inputId}
            >
                {uploading ? (
                    <LoaderCircle
                        size={18}
                        className={
                            styles.ImageUploader__Spinner
                        }
                    />
                ) : (
                    <ImagePlus size={18} />
                )}

                <span>
                    {uploading
                        ? "Uploading..."
                        : "Add photo"}
                </span>

                <input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    disabled={uploading}
                />
            </label>

            {uploadError && (
                <p
                    className={
                        styles.ImageUploader__Error
                    }
                >
                    {uploadError}
                </p>
            )}
        </div>
    );
}