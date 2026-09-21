import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import {
    authFetch,
    API_BASE_URL,
} from "../../../../lib/authFetch.js";

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

    return `${API_SERVER_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

export default function About() {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [topImages, setTopImages] = useState([]);
    const [ourStoryImage, setOurStoryImage] =
        useState(null);

    const [uploadingTopImage, setUploadingTopImage] =
        useState(false);

    const [deletingImageId, setDeletingImageId] =
        useState(null);

    const [uploadingStoryImage, setUploadingStoryImage] =
        useState(false);

    const [
        deletingStoryImage,
        setDeletingStoryImage,
    ] = useState(false);

    const [connect, setConnect] = useState({
        instagram: "",
        tiktok: "",
        email: "",
    });

    const [
        savingConnect,
        setSavingConnect,
    ] = useState(false);

useEffect(() => {
    const controller =
        new AbortController();

    const load = async () => {
        try {
            setLoading(true);
            setError("");

            const pagesResponse =
                await authFetch(
                    "/dashboard/content/pages",
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
                pagesData.data?.pages?.find(
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
                authFetch(
                    `/dashboard/content/pages/${aboutPage.id}`,
                    {
                        signal:
                            controller.signal,
                    }
                ),

                authFetch(
                    "/dashboard/content/about/connect",
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
                        "Failed to load About page content."
                );
            }

            if (
                !connectResponse.ok ||
                !connectData.success
            ) {
                throw new Error(
                    connectData.message ||
                        "Failed to load social links."
                );
            }

            setTopImages(
                (
                    imagesData.data
                        ?.images?.top || []
                ).sort(
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
                    ?.ourStoryImage ||
                    null
            );

            setConnect({
                instagram:
                    connectData.data
                        ?.content
                        ?.instagram_username ||
                    "",

                tiktok:
                    connectData.data
                        ?.content
                        ?.tiktok_username ||
                    "",

                email:
                    connectData.data
                        ?.content?.email ||
                    "",
            });
        } catch (err) {
            if (
                err.name ===
                "AbortError"
            ) {
                return;
            }

            console.error(
                "About content load error:",
                err
            );

            setError(
                err.message ||
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

    const handleSaveConnect = async (
        event
    ) => {
        event.preventDefault();

        setSavingConnect(true);
        setError("");
        setSuccess("");

        try {
            const response =
                await authFetch(
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

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save social links."
                );
            }

            setSuccess(
                "Social links saved successfully."
            );
        } catch (err) {
            console.error(
                "Save connect error:",
                err
            );

            setError(
                err.message ||
                    "Failed to save social links."
            );
        } finally {
            setSavingConnect(false);
        }
    };

    const handleTopImageUpload =
        async (event) => {
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

                const response =
                    await authFetch(
                        `${API_BASE_URL}/dashboard/content/pages/${page.id}/images`,
                        {
                            method: "POST",
                            body: formData,
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to upload image."
                    );
                }

                const uploadedImage =
                    data.image ||
                    data.data ||
                    data;

                setTopImages((current) => [
                    ...current,
                    uploadedImage,
                ]);

                setSuccess(
                    "Carousel image uploaded successfully."
                );
            } catch (err) {
                console.error(
                    "Top image upload error:",
                    err
                );

                setError(
                    err.message ||
                        "Failed to upload carousel image."
                );
            } finally {
                setUploadingTopImage(false);
            }
        };

    const handleDeleteTopImage =
        async (imageId) => {
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
                    await authFetch(
                        `${API_BASE_URL}/dashboard/content/pages/images/${imageId}`,
                        {
                            method: "DELETE",
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to delete image."
                    );
                }

                setTopImages((current) =>
                    current.filter(
                        (image) =>
                            image.id !==
                            imageId
                    )
                );

                setSuccess(
                    "Carousel image deleted successfully."
                );
            } catch (err) {
                console.error(
                    "Delete top image error:",
                    err
                );

                setError(
                    err.message ||
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

        const currentImage =
            topImages[currentIndex];

        const targetImage =
            topImages[targetIndex];

        const newImages = [
            ...topImages,
        ];

        newImages[currentIndex] =
            targetImage;

        newImages[targetIndex] =
            currentImage;

        setTopImages(newImages);
        setError("");
        setSuccess("");

        try {
            const response =
                await authFetch(
                    `${API_BASE_URL}/dashboard/content/pages/images/order`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            imageId,
                            targetImageId:
                                targetImage.id,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to reorder images."
                );
            }
        } catch (err) {
            console.error(
                "Reorder top image error:",
                err
            );

            setTopImages(topImages);

            setError(
                err.message ||
                    "Failed to reorder images."
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
                    await authFetch(
                        `${API_BASE_URL}/dashboard/content/pages/${page.id}/story-image`,
                        {
                            method: "POST",
                            body: formData,
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to upload Our Story image."
                    );
                }

                setOurStoryImage(
                    data.image ||
                        data.data ||
                        data
                );

                setSuccess(
                    "Our Story image uploaded successfully."
                );
            } catch (err) {
                console.error(
                    "Story image upload error:",
                    err
                );

                setError(
                    err.message ||
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
                    await authFetch(
                        `${API_BASE_URL}/dashboard/content/pages/${page.id}/story-image`,
                        {
                            method: "DELETE",
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to delete Our Story image."
                    );
                }

                setOurStoryImage(null);

                setSuccess(
                    "Our Story image deleted successfully."
                );
            } catch (err) {
                console.error(
                    "Delete story image error:",
                    err
                );

                setError(
                    err.message ||
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
            <section className={styles.About}>
                <div className={styles.About__Loading}>
                    Loading About content...
                </div>
            </section>
        );
    }

    return (
        <section className={styles.About}>
            <div className={styles.About__Header}>
                <div>
                    <span
                        className={
                            styles.About__Eyebrow
                        }
                    >
                        Website content
                    </span>

                    <h2
                        className={
                            styles.About__Title
                        }
                    >
                        About
                    </h2>

                    <p
                        className={
                            styles.About__Description
                        }
                    >
                        Manage the content,
                        carousel images,
                        Our Story image and
                        social links displayed
                        on the About page.
                    </p>
                </div>
            </div>

            {error && (
                <div
                    className={
                        styles.About__MessageError
                    }
                >
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        aria-label="Dismiss error"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div
                    className={
                        styles.About__MessageSuccess
                    }
                >
                    <Check size={17} />

                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                        aria-label="Dismiss success message"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <div
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
                            Hero section
                        </span>

                        <h3
                            className={
                                styles.About__SectionTitle
                            }
                        >
                            Top carousel
                        </h3>

                        <p
                            className={
                                styles.About__SectionDescription
                            }
                        >
                            Manage the images
                            displayed in the
                            About page carousel.
                        </p>
                    </div>

                    <label
                        className={
                            styles.About__UploadButton
                        }
                    >
                        <Upload size={17} />

                        <span>
                            {uploadingTopImage
                                ? "Uploading..."
                                : "Add image"}
                        </span>

                        <input
                            type="file"
                            accept="image/*"
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

                {topImages.length === 0 ? (
                    <div
                        className={
                            styles.About__Empty
                        }
                    >
                        <ImagePlus
                            size={30}
                        />

                        <strong>
                            No carousel images
                        </strong>

                        <span>
                            Add an image to
                            display it in the
                            About page carousel.
                        </span>
                    </div>
                ) : (
                    <div
                        className={
                            styles.About__Images
                        }
                    >
                        {topImages.map(
                            (
                                image,
                                index
                            ) => (
                                <div
                                    className={
                                        styles.About__ImageCard
                                    }
                                    key={
                                        image.id
                                    }
                                >
                                    <div
                                        className={
                                            styles.About__ImagePreview
                                        }
                                    >
                                        <img
                                            src={getImageUrl(
                                                image.image_url ||
                                                    image.url ||
                                                    image.path
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
                                                0
                                            }
                                            aria-label="Move image up"
                                        >
                                            <ArrowUp
                                                size={
                                                    16
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
                                                    1
                                            }
                                            aria-label="Move image down"
                                        >
                                            <ArrowDown
                                                size={
                                                    16
                                                }
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                styles.About__DeleteButton
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
                                            aria-label="Delete image"
                                        >
                                            <Trash2
                                                size={
                                                    16
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            <div
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
                            Story section
                        </span>

                        <h3
                            className={
                                styles.About__SectionTitle
                            }
                        >
                            Our Story
                        </h3>

                        <p
                            className={
                                styles.About__SectionDescription
                            }
                        >
                            Manage the image used
                            in the Our Story section.
                        </p>
                    </div>

                    <label
                        className={
                            styles.About__UploadButton
                        }
                    >
                        <Upload size={17} />

                        <span>
                            {uploadingStoryImage
                                ? "Uploading..."
                                : ourStoryImage
                                  ? "Replace image"
                                  : "Add image"}
                        </span>

                        <input
                            type="file"
                            accept="image/*"
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

                {ourStoryImage ? (
                    <div
                        className={
                            styles.About__StoryImage
                        }
                    >
                        <img
                            src={getImageUrl(
                                ourStoryImage.image_url ||
                                    ourStoryImage.url ||
                                    ourStoryImage.path
                            )}
                            alt="Our Story"
                        />

                        <button
                            type="button"
                            onClick={
                                handleDeleteStoryImage
                            }
                            disabled={
                                deletingStoryImage
                            }
                            className={
                                styles.About__StoryDelete
                            }
                        >
                            <Trash2 size={17} />

                            <span>
                                {deletingStoryImage
                                    ? "Deleting..."
                                    : "Delete image"}
                            </span>
                        </button>
                    </div>
                ) : (
                    <div
                        className={
                            styles.About__Empty
                        }
                    >
                        <ImagePlus
                            size={30}
                        />

                        <strong>
                            No Our Story image
                        </strong>

                        <span>
                            Add an image to
                            display in the Our
                            Story section.
                        </span>
                    </div>
                )}
            </div>

            <div
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
                            Contact
                        </span>

                        <h3
                            className={
                                styles.About__SectionTitle
                            }
                        >
                            Connect
                        </h3>

                        <p
                            className={
                                styles.About__SectionDescription
                            }
                        >
                            Manage the social media
                            and email links shown
                            on the About page.
                        </p>
                    </div>
                </div>

                <form
                    className={
                        styles.About__ConnectForm
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
                        <label
                            htmlFor="about-instagram"
                        >
                            <FaInstagram
                                size={17}
                            />

                            <span>
                                Instagram
                            </span>
                        </label>

                        <input
                            id="about-instagram"
                            type="text"
                            value={
                                connect.instagram
                            }
                            onChange={(event) =>
                                setConnect(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        instagram:
                                            event
                                                .target
                                                .value,
                                    })
                                )
                            }
                            placeholder="Instagram URL"
                        />
                    </div>

                    <div
                        className={
                            styles.About__Field
                        }
                    >
                        <label
                            htmlFor="about-tiktok"
                        >
                            <FaTiktok
                                size={17}
                            />

                            <span>
                                TikTok
                            </span>
                        </label>

                        <input
                            id="about-tiktok"
                            type="text"
                            value={
                                connect.tiktok
                            }
                            onChange={(event) =>
                                setConnect(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        tiktok:
                                            event
                                                .target
                                                .value,
                                    })
                                )
                            }
                            placeholder="TikTok URL"
                        />
                    </div>

                    <div
                        className={
                            styles.About__Field
                        }
                    >
                        <label
                            htmlFor="about-email"
                        >
                            <Mail size={17} />

                            <span>
                                Email
                            </span>
                        </label>

                        <input
                            id="about-email"
                            type="email"
                            value={
                                connect.email
                            }
                            onChange={(event) =>
                                setConnect(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        email:
                                            event
                                                .target
                                                .value,
                                    })
                                )
                            }
                            placeholder="Email address"
                        />
                    </div>

                    <div
                        className={
                            styles.About__FormActions
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
                            <Save size={17} />

                            <span>
                                {savingConnect
                                    ? "Saving..."
                                    : "Save changes"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}