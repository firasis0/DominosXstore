import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

import {
    ArrowDown,
    ArrowUp,
    Check,
    ImagePlus,
    Mail,
    Save,
    Trash2,
    Upload,
    X,
} from "lucide-react";

import {
    FaInstagram,
    FaTiktok,
} from "react-icons/fa";

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

const emptyConnect = {
    tiktok_username: "",
    instagram_username: "",
    email: "",
};

export default function About() {
    const [page, setPage] = useState(null);
    const [topImages, setTopImages] = useState([]);
    const [ourStoryImage, setOurStoryImage] =
        useState(null);

    const [connect, setConnect] =
        useState(emptyConnect);

    const [loading, setLoading] =
        useState(true);

    const [uploadingTopImage, setUploadingTopImage] =
        useState(false);

    const [
        uploadingStoryImage,
        setUploadingStoryImage,
    ] = useState(false);

    const [
        deletingImageId,
        setDeletingImageId,
    ] = useState(null);

    const [
        deletingStoryImage,
        setDeletingStoryImage,
    ] = useState(false);

    const [
        reorderingImageId,
        setReorderingImageId,
    ] = useState(null);

    const [
        savingConnect,
        setSavingConnect,
    ] = useState(false);

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

                const aboutPage =
                    pagesData.data.pages.find(
                        (item) =>
                            String(item.name)
                                .trim()
                                .toLowerCase() ===
                            "about"
                    );

                if (!aboutPage) {
                    throw new Error(
                        "About page was not found."
                    );
                }

                setPage(aboutPage);

                const [
                    imagesResponse,
                    connectResponse,
                ] = await Promise.all([
                    fetch(
                        `${API_BASE_URL}/dashboard/content/pages/${aboutPage.id}`,
                        {
                            signal:
                                controller.signal,
                        }
                    ),
                    fetch(
                        `${API_BASE_URL}/dashboard/content/about/connect`,
                        {
                            signal:
                                controller.signal,
                        }
                    ),
                ]);

                const imagesData =
                    await imagesResponse.json();

                const connectData =
                    await connectResponse.json();

                if (
                    !imagesResponse.ok ||
                    !imagesData.success
                ) {
                    throw new Error(
                        imagesData.message ||
                            "Failed to load About images."
                    );
                }

                if (
                    !connectResponse.ok ||
                    !connectData.success
                ) {
                    throw new Error(
                        connectData.message ||
                            "Failed to load About Connect content."
                    );
                }

                const images =
                    imagesData.data.images?.top ||
                    [];

                setTopImages(
                    [...images].sort(
                        (a, b) =>
                            Number(
                                a.sort_order || 0
                            ) -
                            Number(
                                b.sort_order || 0
                            )
                    )
                );

                setOurStoryImage(
                    imagesData.data
                        .ourStoryImage ||
                        null
                );

                setConnect({
                    tiktok_username:
                        connectData.data
                            .content
                            ?.tiktok_username ||
                        "",
                    instagram_username:
                        connectData.data
                            .content
                            ?.instagram_username ||
                        "",
                    email:
                        connectData.data
                            .content?.email ||
                        "",
                });
            } catch (requestError) {
                if (
                    requestError.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Load About content error:",
                    requestError
                );

                setError(
                    requestError.message ||
                        "Failed to load About content."
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

    const handleConnectChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setConnect((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSaveConnect = async (
        event
    ) => {
        event.preventDefault();

        setSavingConnect(true);
        setError("");
        setSuccess("");

        try {
            const response =
                await fetch(
                    `${API_BASE_URL}/dashboard/content/about/connect`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(
                            connect
                        ),
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
                        "Failed to update About Connect content."
                );
            }

            setConnect({
                tiktok_username:
                    data.data.content
                        ?.tiktok_username ||
                    "",
                instagram_username:
                    data.data.content
                        ?.instagram_username ||
                    "",
                email:
                    data.data.content?.email ||
                    "",
            });

            setSuccess(
                "Connect content saved successfully."
            );
        } catch (requestError) {
            console.error(
                "Save About Connect error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to save About Connect content."
            );
        } finally {
            setSavingConnect(false);
        }
    };

    const handleTopImageUpload = async (
        event
    ) => {
        const file =
            event.target.files?.[0];

        event.target.value = "";

        if (!file || !page) {
            return;
        }

        setUploadingTopImage(true);
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
                "top"
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
                        "Failed to upload carousel image."
                );
            }

            setTopImages(
                (current) => [
                    ...current,
                    data.data.image,
                ]
            );

            setSuccess(
                "Carousel image uploaded successfully."
            );
        } catch (requestError) {
            console.error(
                "Upload carousel image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to upload carousel image."
            );
        } finally {
            setUploadingTopImage(
                false
            );
        }
    };

    const handleDeleteTopImage = async (
        imageId
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
                        "Failed to delete carousel image."
                );
            }

            setTopImages(
                (current) =>
                    current.filter(
                        (image) =>
                            image.id !==
                            imageId
                    )
            );

            setSuccess(
                "Carousel image deleted successfully."
            );
        } catch (requestError) {
            console.error(
                "Delete carousel image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to delete carousel image."
            );
        } finally {
            setDeletingImageId(
                null
            );
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
            targetIndex >=
                topImages.length
        ) {
            return;
        }

        setReorderingImageId(
            imageId
        );

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
                        "Failed to reorder carousel image."
                );
            }

            setTopImages(
                (current) => {
                    const updated = [
                        ...current,
                    ];

                    const [
                        movedImage,
                    ] =
                        updated.splice(
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
                }
            );
        } catch (requestError) {
            console.error(
                "Reorder carousel image error:",
                requestError
            );

            setError(
                requestError.message ||
                    "Failed to reorder carousel image."
            );
        } finally {
            setReorderingImageId(
                null
            );
        }
    };

    const handleStoryImageUpload =
        async (event) => {
            const file =
                event.target.files?.[0];

            event.target.value = "";

            if (!file || !page) {
                return;
            }

            setUploadingStoryImage(
                true
            );

            setError("");
            setSuccess("");

            try {
                const formData =
                    new FormData();

                formData.append(
                    "image",
                    file
                );

                const response =
                    await fetch(
                        `${API_BASE_URL}/dashboard/content/pages/${page.id}/our-story-image`,
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
                            "Failed to upload Our Story image."
                    );
                }

                setOurStoryImage(
                    data.data.image
                );

                setSuccess(
                    "Our Story image updated successfully."
                );
            } catch (requestError) {
                console.error(
                    "Upload Our Story image error:",
                    requestError
                );

                setError(
                    requestError.message ||
                        "Failed to upload Our Story image."
                );
            } finally {
                setUploadingStoryImage(
                    false
                );
            }
        };

    const handleDeleteStoryImage =
        async () => {
            if (!ourStoryImage) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Delete the Our Story image?"
                );

            if (!confirmed) {
                return;
            }

            setDeletingStoryImage(
                true
            );

            setError("");
            setSuccess("");

            try {
                const response =
                    await fetch(
                        `${API_BASE_URL}/dashboard/content/about/our-story-image`,
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
                            "Failed to delete Our Story image."
                    );
                }

                setOurStoryImage(
                    null
                );

                setSuccess(
                    "Our Story image deleted successfully."
                );
            } catch (requestError) {
                console.error(
                    "Delete Our Story image error:",
                    requestError
                );

                setError(
                    requestError.message ||
                        "Failed to delete Our Story image."
                );
            } finally {
                setDeletingStoryImage(
                    false
                );
            }
        };

    if (loading) {
        return (
            <section
                className={
                    styles.About
                }
            >
                <div
                    className={
                        styles.About__Loading
                    }
                >
                    Loading About content...
                </div>
            </section>
        );
    }

    return (
        <section
            className={styles.About}
        >
            <div
                className={
                    styles.About__Header
                }
            >
                <div>
                    <span
                        className={
                            styles.About__Eyebrow
                        }
                    >
                        About page
                    </span>

                    <h2
                        className={
                            styles.About__Title
                        }
                    >
                        Manage About
                    </h2>

                    <p
                        className={
                            styles.About__Description
                        }
                    >
                        Manage the content
                        displayed on the
                        About page.
                    </p>
                </div>
            </div>

            {error && (
                <div
                    className={
                        styles.About__MessageError
                    }
                >
                    <X size={16} />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div
                    className={
                        styles.About__MessageSuccess
                    }
                >
                    <Check size={16} />
                    <span>{success}</span>
                </div>
            )}

            <div
                className={
                    styles.About__Sections
                }
            >
                {/* TOP BANNER */}

                <section
                    className={
                        styles.About__Section
                    }
                >
                    <div
                        className={
                            styles.About__SectionHeader
                        }
                    >
                        <div>
                            <span
                                className={
                                    styles.About__SectionEyebrow
                                }
                            >
                                Top Banner
                            </span>

                            <h3
                                className={
                                    styles.About__SectionTitle
                                }
                            >
                                Carousel images
                            </h3>

                            <p
                                className={
                                    styles.About__SectionDescription
                                }
                            >
                                Manage the images
                                displayed in the
                                About page top
                                carousel.
                            </p>
                        </div>

                        <label
                            className={
                                styles.About__PrimaryButton
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
                            styles.About__SectionBody
                        }
                    >
                        {topImages.length > 0 ? (
                            <div
                                className={
                                    styles.About__ImageList
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
                                                styles.About__ImageListItem
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.About__ImageThumbnail
                                                }
                                            >
                                                <img
                                                    src={getImageUrl(
                                                        image.image_url
                                                    )}
                                                    alt={`Carousel ${index + 1}`}
                                                />

                                                <span
                                                    className={
                                                        styles.About__ImageNumber
                                                    }
                                                >
                                                    {index +
                                                        1}
                                                </span>
                                            </div>

                                            <div
                                                className={
                                                    styles.About__ImageListInfo
                                                }
                                            >
                                                <strong>
                                                    Slide{" "}
                                                    {index +
                                                        1}
                                                </strong>

                                                <span>
                                                    Position{" "}
                                                    {index +
                                                        1}{" "}
                                                    of{" "}
                                                    {
                                                        topImages.length
                                                    }
                                                </span>
                                            </div>

                                            <div
                                                className={
                                                    styles.About__ImageActions
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleMoveTopImage(
                                                            image.id,
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
                                                        size={
                                                            15
                                                        }
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleMoveTopImage(
                                                            image.id,
                                                            "down"
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                            topImages.length -
                                                                1 ||
                                                        reorderingImageId ===
                                                            image.id
                                                    }
                                                    title="Move down"
                                                >
                                                    <ArrowDown
                                                        size={
                                                            15
                                                        }
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        styles.About__ImageDelete
                                                    }
                                                    onClick={() =>
                                                        handleDeleteTopImage(
                                                            image.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingImageId ===
                                                        image.id
                                                    }
                                                    title="Delete"
                                                >
                                                    <Trash2
                                                        size={
                                                            14
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div
                                className={
                                    styles.About__Empty
                                }
                            >
                                <div
                                    className={
                                        styles.About__EmptyIcon
                                    }
                                >
                                    <ImagePlus
                                        size={22}
                                    />
                                </div>

                                <strong>
                                    No carousel
                                    images
                                </strong>

                                <span>
                                    Upload images
                                    to create the
                                    About page
                                    carousel.
                                </span>

                                <label
                                    className={
                                        styles.About__UploadButton
                                    }
                                >
                                    <Upload
                                        size={15}
                                    />

                                    <span>
                                        Upload first
                                        image
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
                        )}
                    </div>
                </section>

                {/* OUR STORY */}

                <section
                    className={
                        styles.About__Section
                    }
                >
                    <div
                        className={
                            styles.About__SectionHeader
                        }
                    >
                        <div>
                            <span
                                className={
                                    styles.About__SectionEyebrow
                                }
                            >
                                Our Story
                            </span>

                            <h3
                                className={
                                    styles.About__SectionTitle
                                }
                            >
                                Story image
                            </h3>

                            <p
                                className={
                                    styles.About__SectionDescription
                                }
                            >
                                Change the image
                                displayed beside
                                the Our Story
                                section.
                            </p>
                        </div>
                    </div>

                    <div
                        className={
                            styles.About__SingleImage
                        }
                    >
                        {ourStoryImage ? (
                            <div
                                className={
                                    styles.About__ImageCard
                                }
                            >
                                <div
                                    className={
                                        styles.About__ImagePreview
                                    }
                                >
                                    <img
                                        src={getImageUrl(
                                            ourStoryImage.image_url ||
                                                ourStoryImage.url
                                        )}
                                        alt="Our Story"
                                    />
                                </div>

                                <div
                                    className={
                                        styles.About__ImageInfo
                                    }
                                >
                                    <div>
                                        <strong>
                                            Our Story
                                            image
                                        </strong>

                                        <span>
                                            This image
                                            is displayed
                                            on the About
                                            page.
                                        </span>
                                    </div>

                                    <div
                                        className={
                                            styles.About__ImageActions
                                        }
                                    >
                                        <label
                                            className={
                                                styles.About__SecondaryButton
                                            }
                                        >
                                            <Upload
                                                size={15}
                                            />

                                            <span>
                                                {uploadingStoryImage
                                                    ? "Uploading..."
                                                    : "Replace"}
                                            </span>

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                                onChange={
                                                    handleStoryImageUpload
                                                }
                                                disabled={
                                                    uploadingStoryImage
                                                }
                                                hidden
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            className={
                                                styles.About__DangerButton
                                            }
                                            onClick={
                                                handleDeleteStoryImage
                                            }
                                            disabled={
                                                deletingStoryImage
                                            }
                                        >
                                            <Trash2
                                                size={15}
                                            />

                                            <span>
                                                {deletingStoryImage
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={
                                    styles.About__EmptyImage
                                }
                            >
                                <div
                                    className={
                                        styles.About__EmptyImageIcon
                                    }
                                >
                                    <ImagePlus
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <strong>
                                        No Our Story
                                        image
                                    </strong>

                                    <span>
                                        Upload the
                                        image used
                                        in the Our
                                        Story
                                        section.
                                    </span>
                                </div>

                                <label
                                    className={
                                        styles.About__PrimaryButton
                                    }
                                >
                                    <Upload
                                        size={15}
                                    />

                                    <span>
                                        {uploadingStoryImage
                                            ? "Uploading..."
                                            : "Upload image"}
                                    </span>

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                                        onChange={
                                            handleStoryImageUpload
                                        }
                                        disabled={
                                            uploadingStoryImage
                                        }
                                        hidden
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </section>

                {/* CONNECT */}

                <section
                    className={
                        styles.About__Section
                    }
                >
                    <div
                        className={
                            styles.About__SectionHeader
                        }
                    >
                        <div>
                            <span
                                className={
                                    styles.About__SectionEyebrow
                                }
                            >
                                Connect
                            </span>

                            <h3
                                className={
                                    styles.About__SectionTitle
                                }
                            >
                                Social links
                            </h3>

                            <p
                                className={
                                    styles.About__SectionDescription
                                }
                            >
                                Manage the social
                                accounts displayed
                                in the Connect
                                section.
                            </p>
                        </div>
                    </div>

                    <form
                        className={
                            styles.About__Form
                        }
                        onSubmit={
                            handleSaveConnect
                        }
                    >
                        <div
                            className={
                                styles.About__Field
                            }
                        >
                            <label htmlFor="about-tiktok">
                                <FaTiktok
                                    size={15}
                                />
                                TikTok username
                            </label>

                            <input
                                id="about-tiktok"
                                name="tiktok_username"
                                type="text"
                                value={
                                    connect.tiktok_username
                                }
                                onChange={
                                    handleConnectChange
                                }
                                placeholder="@username"
                            />
                        </div>

                        <div
                            className={
                                styles.About__Field
                            }
                        >
                            <label htmlFor="about-instagram">
                                <FaInstagram
                                    size={15}
                                />
                                Instagram
                                username
                            </label>

                            <input
                                id="about-instagram"
                                name="instagram_username"
                                type="text"
                                value={
                                    connect.instagram_username
                                }
                                onChange={
                                    handleConnectChange
                                }
                                placeholder="@username"
                            />
                        </div>

                        <div
                            className={
                                styles.About__Field
                            }
                        >
                            <label htmlFor="about-email">
                                <Mail size={15} />
                                Email address
                            </label>

                            <input
                                id="about-email"
                                name="email"
                                type="email"
                                value={
                                    connect.email
                                }
                                onChange={
                                    handleConnectChange
                                }
                                placeholder="contact@example.com"
                            />
                        </div>

                        <div
                            className={
                                styles.About__FormFooter
                            }
                        >
                            <button
                                type="submit"
                                className={
                                    styles.About__SaveButton
                                }
                                disabled={
                                    savingConnect
                                }
                            >
                                <Save size={15} />

                                <span>
                                    {savingConnect
                                        ? "Saving..."
                                        : "Save changes"}
                                </span>
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </section>
    );
}