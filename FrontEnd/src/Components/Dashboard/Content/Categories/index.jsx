import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";

import styles from "./styles.module.scss";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

const HOST_BASE_URL =
    import.meta.env.VITE_HOST_BASE_URL ||
    API_BASE_URL.replace(/\/api\/?$/, "");

const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    return `${HOST_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

export default function Categories() {
    const [page, setPage] = useState(null);
    const [topImages, setTopImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [uploadingTopImage, setUploadingTopImage] =
        useState(false);
    const [deletingImageId, setDeletingImageId] =
        useState(null);
    const [reorderingImageId, setReorderingImageId] =
        useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                setSuccess("");

                const pagesResponse = await fetch(
                    `${API_BASE_URL}/dashboard/content/pages`,
                    {
                        signal: controller.signal,
                    }
                );

                const pagesData =
                    await pagesResponse.json();

                if (
                    !pagesResponse.ok ||
                    !pagesData.success
                ) {
                    throw new Error(
                        pagesData.message ||
                            "Failed to load content pages."
                    );
                }

                const categoriesPage =
                    pagesData.data?.pages?.find(
                        (item) =>
                            String(item.name)
                                .trim()
                                .toLowerCase() ===
                            "categories"
                    );

                if (!categoriesPage) {
                    throw new Error(
                        "Categories page was not found."
                    );
                }

                setPage(categoriesPage);

                const imagesResponse = await fetch(
                    `${API_BASE_URL}/dashboard/content/pages/${categoriesPage.id}`,
                    {
                        signal: controller.signal,
                    }
                );

                const imagesData =
                    await imagesResponse.json();

                if (
                    !imagesResponse.ok ||
                    !imagesData.success
                ) {
                    throw new Error(
                        imagesData.message ||
                            "Failed to load Categories images."
                    );
                }

                const images =
                    imagesData.data?.images?.top || [];

                setTopImages(
                    [...images].sort(
                        (a, b) =>
                            Number(a.sort_order || 0) -
                            Number(b.sort_order || 0)
                    )
                );
            } catch (requestError) {
                if (
                    requestError.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Load Categories content error:",
                    requestError
                );

                setError(
                    requestError.message ||
                        "Failed to load Categories content."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            controller.abort();
        };
    }, []);

    const handleTopImageUpload = async (event) => {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file || !page) {
            return;
        }

        setUploadingTopImage(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();

            formData.append("image", file);
            formData.append("section", "top");

            const response = await fetch(
                `${API_BASE_URL}/dashboard/content/pages/${page.id}/images`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Failed to upload carousel image."
                );
            }

            const uploadedImage =
                data.data?.image;

            if (uploadedImage) {
                setTopImages((current) => [
                    ...current,
                    uploadedImage,
                ]);
            }

            setSuccess(
                "Carousel image uploaded successfully."
            );
        } catch (requestError) {
            console.error(
                "Upload Categories carousel image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to upload carousel image."
            );
        } finally {
            setUploadingTopImage(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        const confirmed = window.confirm(
            "Delete this carousel image?"
        );

        if (!confirmed) {
            return;
        }

        setDeletingImageId(imageId);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/dashboard/content/page-images/${imageId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Failed to delete carousel image."
                );
            }

            setTopImages((current) =>
                current.filter(
                    (image) =>
                        image.id !== imageId
                )
            );

            setSuccess(
                "Carousel image deleted successfully."
            );
        } catch (requestError) {
            console.error(
                "Delete Categories carousel image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to delete carousel image."
            );
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleMoveTopImage = async (
        imageId,
        direction
    ) => {
        const currentIndex =
            topImages.findIndex(
                (image) =>
                    image.id === imageId
            );

        if (currentIndex === -1) {
            return;
        }

        const targetIndex =
            direction === "up"
                ? currentIndex - 1
                : currentIndex + 1;

        if (
            targetIndex < 0 ||
            targetIndex >= topImages.length
        ) {
            return;
        }

        setReorderingImageId(imageId);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/dashboard/content/page-images/${imageId}/order`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        sort_order:
                            targetIndex,
                    }),
                }
            );

            const data = await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Failed to reorder carousel image."
                );
            }

            setTopImages((current) => {
                const updated = [
                    ...current,
                ];

                const [
                    movedImage,
                ] = updated.splice(
                    currentIndex,
                    1
                );

                updated.splice(
                    targetIndex,
                    0,
                    movedImage
                );

                return updated.map(
                    (image, index) => ({
                        ...image,
                        sort_order:
                            index,
                    })
                );
            });

            setSuccess(
                "Carousel order updated successfully."
            );
        } catch (requestError) {
            console.error(
                "Reorder Categories carousel image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to reorder carousel image."
            );
        } finally {
            setReorderingImageId(null);
        }
    };

    if (loading) {
        return (
            <section
                className={styles.Categories}
            >
                <div
                    className={
                        styles.Categories__Loading
                    }
                >
                    Loading Categories content...
                </div>
            </section>
        );
    }

    return (
        <section
            className={styles.Categories}
        >
            <div
                className={
                    styles.Categories__Header
                }
            >
                <div>
                    <span
                        className={
                            styles.Categories__Eyebrow
                        }
                    >
                        Categories page
                    </span>

                    <h2
                        className={
                            styles.Categories__Title
                        }
                    >
                        Manage Categories
                    </h2>

                    <p
                        className={
                            styles.Categories__Description
                        }
                    >
                        Manage the content displayed
                        on the Categories page.
                    </p>
                </div>
            </div>

            {error && (
                <div
                    className={
                        styles.Categories__MessageError
                    }
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    className={
                        styles.Categories__MessageSuccess
                    }
                >
                    {success}
                </div>
            )}

            <div
                className={
                    styles.Categories__Sections
                }
            >
                <section
                    className={
                        styles.Categories__Section
                    }
                >
                    <div
                        className={
                            styles.Categories__SectionHeader
                        }
                    >
                        <div>
                            <span
                                className={
                                    styles.Categories__SectionEyebrow
                                }
                            >
                                Top Banner
                            </span>

                            <h3
                                className={
                                    styles.Categories__SectionTitle
                                }
                            >
                                Carousel images
                            </h3>

                            <p
                                className={
                                    styles.Categories__SectionDescription
                                }
                            >
                                Manage the images
                                displayed in the
                                Categories page top
                                carousel.
                            </p>
                        </div>

                        <label
                            className={
                                styles.Categories__PrimaryButton
                            }
                        >
                            <Upload size={15} />

                            <span>
                                {uploadingTopImage
                                    ? "Uploading..."
                                    : "Upload image"}
                            </span>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                onChange={
                                    handleTopImageUpload
                                }
                                disabled={
                                    uploadingTopImage
                                }
                                hidden
                            />
                        </label>
                    </div>

                    <div
                        className={
                            styles.Categories__SectionBody
                        }
                    >
                        {topImages.length > 0 ? (
                            <div
                                className={
                                    styles.Categories__ImageGrid
                                }
                            >
                                {topImages.map(
                                    (
                                        image,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                image.id
                                            }
                                            className={
                                                styles.Categories__ImageCard
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.Categories__ImagePreview
                                                }
                                            >
                                                <img
                                                    src={getImageUrl(
                                                        image.image_url
                                                    )}
                                                    alt={`Carousel ${
                                                        index +
                                                        1
                                                    }`}
                                                />

                                                <span
                                                    className={
                                                        styles.Categories__ImageNumber
                                                    }
                                                >
                                                    {index +
                                                        1}
                                                </span>
                                            </div>

                                            <div
                                                className={
                                                    styles.Categories__ImageCardFooter
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.Categories__ImageCardInfo
                                                    }
                                                >
                                                    <strong>
                                                        Slide{" "}
                                                        {index +
                                                            1}
                                                    </strong>

                                                    <span>
                                                        Top Banner
                                                    </span>
                                                </div>

                                                <div
                                                    className={
                                                        styles.Categories__ImageActions
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            index ===
                                                                0 ||
                                                            reorderingImageId !==
                                                                null
                                                        }
                                                        onClick={() =>
                                                            handleMoveTopImage(
                                                                image.id,
                                                                "up"
                                                            )
                                                        }
                                                        aria-label="Move image up"
                                                    >
                                                        <ArrowUp
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            index ===
                                                                topImages.length -
                                                                    1 ||
                                                            reorderingImageId !==
                                                                null
                                                        }
                                                        onClick={() =>
                                                            handleMoveTopImage(
                                                                image.id,
                                                                "down"
                                                            )
                                                        }
                                                        aria-label="Move image down"
                                                    >
                                                        <ArrowDown
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.Categories__DeleteButton
                                                        }
                                                        disabled={
                                                            deletingImageId ===
                                                            image.id
                                                        }
                                                        onClick={() =>
                                                            handleDeleteImage(
                                                                image.id
                                                            )
                                                        }
                                                        aria-label="Delete image"
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div
                                className={
                                    styles.Categories__Empty
                                }
                            >
                                <strong>
                                    No carousel images
                                    yet.
                                </strong>

                                <span>
                                    Upload an image to
                                    add the first
                                    Categories page
                                    banner.
                                </span>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}