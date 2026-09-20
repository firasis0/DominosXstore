import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

import {
    ArrowDown,
    ArrowUp,
    Check,
    ImagePlus,
    Trash2,
    Upload,
    X,
} from "lucide-react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3002/api";

const API_SERVER_URL = API_BASE_URL.replace(
    /\/api\/?$/,
    ""
);

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

    return `${API_SERVER_URL}${
        imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
};

const sortImages = (images) =>
    [...images].sort(
        (a, b) =>
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
    );

export default function Home() {
    const [page, setPage] = useState(null);

    const [topImages, setTopImages] = useState([]);
    const [middleImages, setMiddleImages] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [uploadingSection, setUploadingSection] =
        useState(null);

    const [deletingImageId, setDeletingImageId] =
        useState(null);

    const [reorderingImageId, setReorderingImageId] =
        useState(null);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    useEffect(() => {
        const controller =
            new AbortController();

        const load = async () => {
            try {
                setLoading(true);
                setError("");

                const pagesResponse =
                    await fetch(
                        `${API_BASE_URL}/dashboard/content/pages`,
                        {
                            signal:
                                controller.signal,
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

                const homePage =
                    pagesData.data.pages.find(
                        (item) =>
                            String(item.name)
                                .trim()
                                .toLowerCase() ===
                            "home"
                    );

                if (!homePage) {
                    throw new Error(
                        "Home page was not found."
                    );
                }

                setPage(homePage);

                const response =
                    await fetch(
                        `${API_BASE_URL}/dashboard/content/pages/${homePage.id}`,
                        {
                            signal:
                                controller.signal,
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                            "Failed to load Home images."
                    );
                }

                setTopImages(
                    sortImages(
                        data.data.images?.top ||
                            []
                    )
                );

                setMiddleImages(
                    sortImages(
                        data.data.images?.middle ||
                            []
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
                    "Load Home content error:",
                    requestError
                );

                setError(
                    requestError.message ||
                        "Failed to load Home content."
                );
            } finally {
                if (
                    !controller.signal.aborted
                ) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            controller.abort();
        };
    }, []);

    const handleUpload = async (
        event,
        section
    ) => {
        const file =
            event.target.files?.[0];

        event.target.value = "";

        if (!file || !page) {
            return;
        }

        setUploadingSection(section);
        setError("");
        setSuccess("");

        try {
            const formData =
                new FormData();

            formData.append(
                "image",
                file
            );

            formData.append(
                "section",
                section
            );

            const response =
                await fetch(
                    `${API_BASE_URL}/dashboard/content/pages/${page.id}/images`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Failed to upload image."
                );
            }

            const uploadedImage =
                data.data.image;

            if (section === "top") {
                setTopImages(
                    (current) => [
                        ...current,
                        uploadedImage,
                    ]
                );
            } else {
                setMiddleImages(
                    (current) => [
                        ...current,
                        uploadedImage,
                    ]
                );
            }

            setSuccess(
                `${
                    section === "top"
                        ? "Top"
                        : "Middle"
                } banner image uploaded successfully.`
            );
        } catch (requestError) {
            console.error(
                "Upload Home image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to upload image."
            );
        } finally {
            setUploadingSection(null);
        }
    };

    const handleDelete = async (
        imageId,
        section
    ) => {
        const confirmed =
            window.confirm(
                "Delete this carousel image?"
            );

        if (!confirmed) {
            return;
        }

        setDeletingImageId(imageId);
        setError("");
        setSuccess("");

        try {
            const response =
                await fetch(
                    `${API_BASE_URL}/dashboard/content/page-images/${imageId}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Failed to delete image."
                );
            }

            if (section === "top") {
                setTopImages(
                    (current) =>
                        current.filter(
                            (image) =>
                                image.id !==
                                imageId
                        )
                );
            } else {
                setMiddleImages(
                    (current) =>
                        current.filter(
                            (image) =>
                                image.id !==
                                imageId
                        )
                );
            }

            setSuccess(
                "Carousel image deleted successfully."
            );
        } catch (requestError) {
            console.error(
                "Delete Home image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to delete image."
            );
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleMove = async (
        imageId,
        section,
        direction
    ) => {
        const images =
            section === "top"
                ? topImages
                : middleImages;

        const currentIndex =
            images.findIndex(
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
            targetIndex >= images.length
        ) {
            return;
        }

        setReorderingImageId(imageId);
        setError("");
        setSuccess("");

        try {
            const response =
                await fetch(
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

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        "Failed to reorder image."
                );
            }

            const reorder = (
                current
            ) => {
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
                    (
                        image,
                        index
                    ) => ({
                        ...image,
                        sort_order:
                            index,
                    })
                );
            };

            if (section === "top") {
                setTopImages(reorder);
            } else {
                setMiddleImages(
                    reorder
                );
            }
        } catch (requestError) {
            console.error(
                "Reorder Home image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to reorder image."
            );
        } finally {
            setReorderingImageId(null);
        }
    };

    const renderImageList = (
        images,
        section
    ) => {
        if (images.length === 0) {
            return (
                <div
                    className={
                        styles.Home__Empty
                    }
                >
                    <div
                        className={
                            styles.Home__EmptyIcon
                        }
                    >
                        <ImagePlus size={21} />
                    </div>

                    <div
                        className={
                            styles.Home__EmptyText
                        }
                    >
                        <strong>
                            No images
                        </strong>

                        <span>
                            Upload images to
                            create this
                            carousel.
                        </span>
                    </div>

                    <label
                        className={
                            styles.Home__UploadButton
                        }
                    >
                        <Upload size={14} />

                        <span>
                            Upload image
                        </span>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            onChange={(event) =>
                                handleUpload(
                                    event,
                                    section
                                )
                            }
                            disabled={
                                uploadingSection ===
                                section
                            }
                            hidden
                        />
                    </label>
                </div>
            );
        }

        return (
            <div
                className={
                    styles.Home__ImageList
                }
            >
                {images.map(
                    (
                        image,
                        index
                    ) => (
                        <div
                            key={image.id}
                            className={
                                styles.Home__ImageListItem
                            }
                        >
                            <div
                                className={
                                    styles.Home__ImageThumbnail
                                }
                            >
                                <img
                                    src={getImageUrl(
                                        image.image_url
                                    )}
                                    alt={`${
                                        section ===
                                        "top"
                                            ? "Top"
                                            : "Middle"
                                    } banner ${
                                        index + 1
                                    }`}
                                />

                                <span
                                    className={
                                        styles.Home__ImageNumber
                                    }
                                >
                                    {index + 1}
                                </span>
                            </div>

                            <div
                                className={
                                    styles.Home__ImageInfo
                                }
                            >
                                <strong>
                                    Slide{" "}
                                    {index + 1}
                                </strong>

                                <span>
                                    Position{" "}
                                    {index + 1}{" "}
                                    of{" "}
                                    {
                                        images.length
                                    }
                                </span>
                            </div>

                            <div
                                className={
                                    styles.Home__ImageActions
                                }
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleMove(
                                            image.id,
                                            section,
                                            "up"
                                        )
                                    }
                                    disabled={
                                        index ===
                                            0 ||
                                        reorderingImageId ===
                                            image.id
                                    }
                                    title="Move up"
                                >
                                    <ArrowUp
                                        size={14}
                                    />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleMove(
                                            image.id,
                                            section,
                                            "down"
                                        )
                                    }
                                    disabled={
                                        index ===
                                            images.length -
                                                1 ||
                                        reorderingImageId ===
                                            image.id
                                    }
                                    title="Move down"
                                >
                                    <ArrowDown
                                        size={14}
                                    />
                                </button>

                                <button
                                    type="button"
                                    className={
                                        styles.Home__DeleteButton
                                    }
                                    onClick={() =>
                                        handleDelete(
                                            image.id,
                                            section
                                        )
                                    }
                                    disabled={
                                        deletingImageId ===
                                        image.id
                                    }
                                    title="Delete"
                                >
                                    <Trash2
                                        size={14}
                                    />
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <section
                className={
                    styles.Home
                }
            >
                <div
                    className={
                        styles.Home__Loading
                    }
                >
                    Loading Home content...
                </div>
            </section>
        );
    }

    return (
        <section
            className={styles.Home}
        >
            <div
                className={
                    styles.Home__Header
                }
            >
                <div>
                    <span
                        className={
                            styles.Home__Eyebrow
                        }
                    >
                        Home page
                    </span>

                    <h2
                        className={
                            styles.Home__Title
                        }
                    >
                        Manage Home
                    </h2>

                    <p
                        className={
                            styles.Home__Description
                        }
                    >
                        Manage the two carousel
                        sections displayed on
                        the Home page.
                    </p>
                </div>
            </div>

            {error && (
                <div
                    className={
                        styles.Home__MessageError
                    }
                >
                    <X size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div
                    className={
                        styles.Home__MessageSuccess
                    }
                >
                    <Check size={16} />
                    <span>{success}</span>
                </div>
            )}

            <div
                className={
                    styles.Home__Sections
                }
            >
                {/* TOP BANNER */}

                <section
                    className={
                        styles.Home__Section
                    }
                >
                    <div
                        className={
                            styles.Home__SectionHeader
                        }
                    >
                        <div>
                            <span
                                className={
                                    styles.Home__SectionEyebrow
                                }
                            >
                                Top Banner
                            </span>

                            <h3
                                className={
                                    styles.Home__SectionTitle
                                }
                            >
                                Top carousel
                            </h3>

                            <p
                                className={
                                    styles.Home__SectionDescription
                                }
                            >
                                Manage the images
                                displayed below
                                the Home
                                navigation.
                            </p>
                        </div>

                        <label
                            className={
                                styles.Home__PrimaryButton
                            }
                        >
                            <Upload size={14} />

                            <span>
                                {uploadingSection ===
                                "top"
                                    ? "Uploading..."
                                    : "Upload image"}
                            </span>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                onChange={(event) =>
                                    handleUpload(
                                        event,
                                        "top"
                                    )
                                }
                                disabled={
                                    uploadingSection ===
                                    "top"
                                }
                                hidden
                            />
                        </label>
                    </div>

                    <div
                        className={
                            styles.Home__SectionBody
                        }
                    >
                        {renderImageList(
                            topImages,
                            "top"
                        )}
                    </div>
                </section>

                {/* MIDDLE BANNER */}

                <section
                    className={
                        styles.Home__Section
                    }
                >
                    <div
                        className={
                            styles.Home__SectionHeader
                        }
                    >
                        <div>
                            <span
                                className={
                                    styles.Home__SectionEyebrow
                                }
                            >
                                Middle Banner
                            </span>

                            <h3
                                className={
                                    styles.Home__SectionTitle
                                }
                            >
                                Middle carousel
                            </h3>

                            <p
                                className={
                                    styles.Home__SectionDescription
                                }
                            >
                                Manage the images
                                displayed
                                between the
                                product sections
                                and brands.
                            </p>
                        </div>

                        <label
                            className={
                                styles.Home__PrimaryButton
                            }
                        >
                            <Upload size={14} />

                            <span>
                                {uploadingSection ===
                                "middle"
                                    ? "Uploading..."
                                    : "Upload image"}
                            </span>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                onChange={(event) =>
                                    handleUpload(
                                        event,
                                        "middle"
                                    )
                                }
                                disabled={
                                    uploadingSection ===
                                    "middle"
                                }
                                hidden
                            />
                        </label>
                    </div>

                    <div
                        className={
                            styles.Home__SectionBody
                        }
                    >
                        {renderImageList(
                            middleImages,
                            "middle"
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}