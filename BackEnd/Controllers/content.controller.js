import db from "../DB/db.js";
import fs from "fs";
import path from "path";

const ABOUT_PAGE_NAME = "about";
const ALLOWED_SECTIONS = ["top", "middle"];

const normalizeUsername = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    const normalized = String(value).trim();

    return normalized || null;
};

const normalizeEmail = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    const normalized = String(value).trim();

    return normalized || null;
};

const buildSocialLinks = (content) => {
    const socialLinks = [];

    if (content?.tiktok_username) {
        const username = content.tiktok_username.replace(
            /^@/,
            ""
        );

        socialLinks.push({
            id: "tiktok",
            type: "tiktok",
            name: "TikTok",
            username: `@${username}`,
            href: `https://www.tiktok.com/@${username}`,
        });
    }

    if (content?.instagram_username) {
        const username =
            content.instagram_username.replace(/^@/, "");

        socialLinks.push({
            id: "instagram",
            type: "instagram",
            name: "Instagram",
            username: `@${username}`,
            href: `https://www.instagram.com/${username}/`,
        });
    }

    if (content?.email) {
        socialLinks.push({
            id: "email",
            type: "email",
            name: "Email",
            username: content.email,
            href: `mailto:${content.email}`,
        });
    }

    return socialLinks;
};

const removeUploadedFile = (filePath) => {
    if (!filePath) {
        return;
    }

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(
            "Failed to remove uploaded file:",
            error
        );
    }
};

const getStoredFilePath = (imageUrl) => {
    if (!imageUrl) {
        return null;
    }

    const normalizedUrl = imageUrl
        .replace(/^\/+/, "")
        .replace(/\//g, path.sep);

    return path.resolve(
        process.cwd(),
        normalizedUrl
    );
};

const getAboutContent = async () => {
    const result = await db.query(
        `
            SELECT
                p.id AS page_id,
                p.name AS page_name,
                ac.id AS about_content_id,
                ac.tiktok_username,
                ac.instagram_username,
                ac.email,
                ac.our_story_image_url
            FROM public.pages p
            LEFT JOIN public.about_contents ac
                ON ac.id = p.id
            WHERE LOWER(p.name) = $1
            LIMIT 1
        `,
        [ABOUT_PAGE_NAME]
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "About page was not found."
        );

        error.statusCode = 404;

        throw error;
    }

    const row = result.rows[0];

    return {
        page: {
            id: row.page_id,
            name: row.page_name,
        },

        content: {
            id: row.about_content_id,
            tiktok_username:
                row.tiktok_username,
            instagram_username:
                row.instagram_username,
            email: row.email,
            our_story_image_url:
                row.our_story_image_url,
        },

        socialLinks: buildSocialLinks(row),
    };
};

/* =========================================================
   PUBLIC ABOUT CONNECT
   ========================================================= */

export const getAboutConnect = async (req, res) => {
    try {
        const about = await getAboutContent();

        return res.status(200).json({
            success: true,

            data: {
                page: about.page,

                connect: {
                    socialLinks:
                        about.socialLinks,
                },
            },
        });
    } catch (error) {
        console.error(
            "Get About Connect error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to load About Connect content.",
        });
    }
};

/* =========================================================
   DASHBOARD ABOUT CONNECT
   ========================================================= */

export const getDashboardAboutConnect = async (
    req,
    res
) => {
    try {
        const about = await getAboutContent();

        return res.status(200).json({
            success: true,

            data: {
                page: about.page,
                content: about.content,
                socialLinks:
                    about.socialLinks,
            },
        });
    } catch (error) {
        console.error(
            "Get Dashboard About Connect error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to load About Connect content.",
        });
    }
};

export const updateDashboardAboutConnect = async (
    req,
    res
) => {
    try {
        const tiktokUsername =
            normalizeUsername(
                req.body?.tiktok_username
            );

        const instagramUsername =
            normalizeUsername(
                req.body?.instagram_username
            );

        const email = normalizeEmail(
            req.body?.email
        );

        if (email) {
            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid email address.",
                });
            }
        }

        const pageResult = await db.query(
            `
                SELECT id, name
                FROM public.pages
                WHERE LOWER(name) = $1
                LIMIT 1
            `,
            [ABOUT_PAGE_NAME]
        );

        if (pageResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "About page was not found.",
            });
        }

        const page = pageResult.rows[0];

        const result = await db.query(
            `
                INSERT INTO public.about_contents
                (
                    id,
                    tiktok_username,
                    instagram_username,
                    email
                )
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id)
                DO UPDATE SET
                    tiktok_username =
                        EXCLUDED.tiktok_username,
                    instagram_username =
                        EXCLUDED.instagram_username,
                    email =
                        EXCLUDED.email
                RETURNING
                    id,
                    tiktok_username,
                    instagram_username,
                    email,
                    our_story_image_url
            `,
            [
                page.id,
                tiktokUsername,
                instagramUsername,
                email,
            ]
        );

        const content = result.rows[0];

        return res.status(200).json({
            success: true,
            message:
                "About Connect content updated successfully.",

            data: {
                page: {
                    id: page.id,
                    name: page.name,
                },

                content: {
                    id: content.id,
                    tiktok_username:
                        content.tiktok_username,
                    instagram_username:
                        content.instagram_username,
                    email: content.email,
                    our_story_image_url:
                        content.our_story_image_url,
                },

                socialLinks:
                    buildSocialLinks(content),
            },
        });
    } catch (error) {
        console.error(
            "Update Dashboard About Connect error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update About Connect content.",
        });
    }
};

/* =========================================================
   CONTENT PAGES
   ========================================================= */

export const getContentPages = async (
    req,
    res
) => {
    try {
        const result = await db.query(
            `
                SELECT
                    id,
                    name
                FROM public.pages
                ORDER BY id ASC
            `
        );

        return res.status(200).json({
            success: true,
            data: {
                pages: result.rows,
            },
        });
    } catch (error) {
        console.error(
            "Get content pages error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to load content pages.",
        });
    }
};

/* =========================================================
   PAGE CONTENT
   ========================================================= */

export const getPageContent = async (
    req,
    res
) => {
    try {
        const pageId = Number(
            req.params.pageId
        );

        if (!Number.isInteger(pageId) || pageId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid page ID.",
            });
        }

        const pageResult = await db.query(
            `
                SELECT
                    id,
                    name
                FROM public.pages
                WHERE id = $1
                LIMIT 1
            `,
            [pageId]
        );

        if (pageResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Page was not found.",
            });
        }

        const page = pageResult.rows[0];

        const imagesResult = await db.query(
            `
                SELECT
                    id,
                    page_id,
                    image_url,
                    section,
                    sort_order
                FROM public.page_images
                WHERE page_id = $1
                ORDER BY
                    section ASC,
                    sort_order ASC,
                    id ASC
            `,
            [pageId]
        );

        const images = {
            top: [],
            middle: [],
        };

        for (const image of imagesResult.rows) {
            if (
                Object.prototype.hasOwnProperty.call(
                    images,
                    image.section
                )
            ) {
                images[image.section].push(
                    image
                );
            }
        }

        let ourStoryImage = null;

        if (
            String(page.name)
                .trim()
                .toLowerCase() ===
            ABOUT_PAGE_NAME
        ) {
            const aboutResult =
                await db.query(
                    `
                        SELECT
                            our_story_image_url
                        FROM public.about_contents
                        WHERE id = $1
                        LIMIT 1
                    `,
                    [pageId]
                );

            if (
                aboutResult.rows.length > 0 &&
                aboutResult.rows[0]
                    .our_story_image_url
            ) {
                ourStoryImage = {
                    image_url:
                        aboutResult.rows[0]
                            .our_story_image_url,
                };
            }
        }

        return res.status(200).json({
            success: true,

            data: {
                page,
                images,
                ourStoryImage,
            },
        });
    } catch (error) {
        console.error(
            "Get page content error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to load page content.",
        });
    }
};

/* =========================================================
   PAGE IMAGE UPLOAD
   ========================================================= */

export const uploadPageImage = async (
    req,
    res
) => {
    try {
        const pageId = Number(
            req.params.pageId
        );

        const section = String(
            req.body?.section || ""
        )
            .trim()
            .toLowerCase();

        if (!Number.isInteger(pageId) || pageId <= 0) {
            removeUploadedFile(req.file?.path);

            return res.status(400).json({
                success: false,
                message: "Invalid page ID.",
            });
        }

        if (!ALLOWED_SECTIONS.includes(section)) {
            removeUploadedFile(req.file?.path);

            return res.status(400).json({
                success: false,
                message:
                    "Invalid image section.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required.",
            });
        }

        const pageResult = await db.query(
            `
                SELECT
                    id,
                    name
                FROM public.pages
                WHERE id = $1
                LIMIT 1
            `,
            [pageId]
        );

        if (pageResult.rows.length === 0) {
            removeUploadedFile(req.file.path);

            return res.status(404).json({
                success: false,
                message: "Page was not found.",
            });
        }

        const page = pageResult.rows[0];

        if (
            String(page.name)
                .trim()
                .toLowerCase() ===
                ABOUT_PAGE_NAME &&
            section === "middle"
        ) {
            const existingResult =
                await db.query(
                    `
                        SELECT id
                        FROM public.page_images
                        WHERE page_id = $1
                          AND section = $2
                        LIMIT 1
                    `,
                    [pageId, section]
                );

            if (existingResult.rows.length > 0) {
                removeUploadedFile(req.file.path);

                return res.status(409).json({
                    success: false,
                    message:
                        "The About middle image already exists. Delete it before uploading another image.",
                });
            }
        }

        const orderResult = await db.query(
            `
                SELECT
                    COALESCE(
                        MAX(sort_order),
                        -1
                    ) + 1 AS next_sort_order
                FROM public.page_images
                WHERE page_id = $1
                  AND section = $2
            `,
            [pageId, section]
        );

        const sortOrder = Number(
            orderResult.rows[0]
                .next_sort_order
        );

        const imageUrl = `/uploads/content/${req.file.filename}`;

        try {
            const imageResult =
                await db.query(
                    `
                        INSERT INTO public.page_images
                        (
                            page_id,
                            image_url,
                            section,
                            sort_order
                        )
                        VALUES ($1, $2, $3, $4)
                        RETURNING
                            id,
                            page_id,
                            image_url,
                            section,
                            sort_order
                    `,
                    [
                        pageId,
                        imageUrl,
                        section,
                        sortOrder,
                    ]
                );

            return res.status(201).json({
                success: true,
                message:
                    "Page image uploaded successfully.",
                data: {
                    image:
                        imageResult.rows[0],
                },
            });
        } catch (error) {
            removeUploadedFile(req.file.path);
            throw error;
        }
    } catch (error) {
        console.error(
            "Upload page image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to upload page image.",
        });
    }
};

/* =========================================================
   OUR STORY IMAGE UPLOAD
   ========================================================= */

export const uploadOurStoryImage = async (
    req,
    res
) => {
    try {
        const pageId = Number(
            req.params.pageId
        );

        if (!Number.isInteger(pageId) || pageId <= 0) {
            removeUploadedFile(req.file?.path);

            return res.status(400).json({
                success: false,
                message: "Invalid page ID.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required.",
            });
        }

        const pageResult = await db.query(
            `
                SELECT
                    id,
                    name
                FROM public.pages
                WHERE id = $1
                LIMIT 1
            `,
            [pageId]
        );

        if (pageResult.rows.length === 0) {
            removeUploadedFile(req.file.path);

            return res.status(404).json({
                success: false,
                message: "Page was not found.",
            });
        }

        const page = pageResult.rows[0];

        if (
            String(page.name)
                .trim()
                .toLowerCase() !==
            ABOUT_PAGE_NAME
        ) {
            removeUploadedFile(req.file.path);

            return res.status(400).json({
                success: false,
                message:
                    "Our Story image can only be managed for the About page.",
            });
        }

        const aboutResult = await db.query(
            `
                SELECT
                    id,
                    our_story_image_url
                FROM public.about_contents
                WHERE id = $1
                LIMIT 1
            `,
            [pageId]
        );

        const imageUrl = `/uploads/content/${req.file.filename}`;

        if (aboutResult.rows.length === 0) {
            try {
                await db.query(
                    `
                        INSERT INTO public.about_contents
                        (
                            id,
                            our_story_image_url
                        )
                        VALUES ($1, $2)
                    `,
                    [pageId, imageUrl]
                );
            } catch (error) {
                removeUploadedFile(
                    req.file.path
                );
                throw error;
            }

            return res.status(201).json({
                success: true,
                message:
                    "Our Story image uploaded successfully.",
                data: {
                    image: {
                        image_url: imageUrl,
                    },
                },
            });
        }

        const oldImageUrl =
            aboutResult.rows[0]
                .our_story_image_url;

        try {
            await db.query(
                `
                    UPDATE public.about_contents
                    SET our_story_image_url = $1
                    WHERE id = $2
                `,
                [imageUrl, pageId]
            );
        } catch (error) {
            removeUploadedFile(
                req.file.path
            );
            throw error;
        }

        if (
            oldImageUrl &&
            oldImageUrl !== imageUrl
        ) {
            removeUploadedFile(
                getStoredFilePath(
                    oldImageUrl
                )
            );
        }

        return res.status(200).json({
            success: true,
            message:
                "Our Story image updated successfully.",
            data: {
                image: {
                    image_url: imageUrl,
                },
            },
        });
    } catch (error) {
        console.error(
            "Upload Our Story image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to upload Our Story image.",
        });
    }
};

/* =========================================================
   OUR STORY IMAGE DELETE
   ========================================================= */

export const deleteOurStoryImage = async (
    req,
    res
) => {
    try {
        const pageResult = await db.query(
            `
                SELECT
                    p.id,
                    p.name,
                    ac.our_story_image_url
                FROM public.pages p
                LEFT JOIN public.about_contents ac
                    ON ac.id = p.id
                WHERE LOWER(p.name) = $1
                LIMIT 1
            `,
            [ABOUT_PAGE_NAME]
        );

        if (pageResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "About page was not found.",
            });
        }

        const page = pageResult.rows[0];

        if (!page.our_story_image_url) {
            return res.status(404).json({
                success: false,
                message:
                    "No Our Story image exists.",
            });
        }

        const imageUrl =
            page.our_story_image_url;

        await db.query(
            `
                UPDATE public.about_contents
                SET our_story_image_url = NULL
                WHERE id = $1
            `,
            [page.id]
        );

        removeUploadedFile(
            getStoredFilePath(imageUrl)
        );

        return res.status(200).json({
            success: true,
            message:
                "Our Story image deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete Our Story image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete Our Story image.",
        });
    }
};

/* =========================================================
   DELETE PAGE IMAGE
   ========================================================= */

export const deletePageImage = async (
    req,
    res
) => {
    try {
        const imageId = Number(
            req.params.imageId
        );

        if (
            !Number.isInteger(imageId) ||
            imageId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid image ID.",
            });
        }

        const imageResult = await db.query(
            `
                SELECT
                    id,
                    page_id,
                    image_url,
                    section
                FROM public.page_images
                WHERE id = $1
                LIMIT 1
            `,
            [imageId]
        );

        if (imageResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Image was not found.",
            });
        }

        const image = imageResult.rows[0];

        await db.query(
            `
                DELETE FROM public.page_images
                WHERE id = $1
            `,
            [imageId]
        );

        removeUploadedFile(
            getStoredFilePath(
                image.image_url
            )
        );

        const remainingResult =
            await db.query(
                `
                    SELECT id
                    FROM public.page_images
                    WHERE page_id = $1
                      AND section = $2
                    ORDER BY
                        sort_order ASC,
                        id ASC
                `,
                [
                    image.page_id,
                    image.section,
                ]
            );

        for (
            let index = 0;
            index < remainingResult.rows.length;
            index += 1
        ) {
            await db.query(
                `
                    UPDATE public.page_images
                    SET sort_order = $1
                    WHERE id = $2
                `,
                [
                    index,
                    remainingResult.rows[
                        index
                    ].id,
                ]
            );
        }

        return res.status(200).json({
            success: true,
            message:
                "Page image deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete page image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete page image.",
        });
    }
};

/* =========================================================
   REORDER PAGE IMAGE
   ========================================================= */

export const reorderPageImage = async (
    req,
    res
) => {
    const client = await db.connect();

    try {
        const imageId = Number(
            req.params.imageId
        );

        const newSortOrder = Number(
            req.body?.sort_order
        );

        if (
            !Number.isInteger(imageId) ||
            imageId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid image ID.",
            });
        }

        if (!Number.isInteger(newSortOrder)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid sort order.",
            });
        }

        await client.query("BEGIN");

        const imageResult =
            await client.query(
                `
                    SELECT
                        id,
                        page_id,
                        section,
                        sort_order
                    FROM public.page_images
                    WHERE id = $1
                    FOR UPDATE
                `,
                [imageId]
            );

        if (imageResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Image was not found.",
            });
        }

        const image = imageResult.rows[0];

        const imagesResult =
            await client.query(
                `
                    SELECT
                        id,
                        sort_order
                    FROM public.page_images
                    WHERE page_id = $1
                      AND section = $2
                    ORDER BY
                        sort_order ASC,
                        id ASC
                    FOR UPDATE
                `,
                [
                    image.page_id,
                    image.section,
                ]
            );

        const images =
            imagesResult.rows;

        const currentIndex =
            images.findIndex(
                (item) =>
                    item.id === imageId
            );

        if (currentIndex === -1) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message:
                    "Image was not found in its section.",
            });
        }

        const targetIndex = Math.max(
            0,
            Math.min(
                newSortOrder,
                images.length - 1
            )
        );

        if (
            currentIndex !==
            targetIndex
        ) {
            const [movedImage] =
                images.splice(
                    currentIndex,
                    1
                );

            images.splice(
                targetIndex,
                0,
                movedImage
            );
        }

        for (
            let index = 0;
            index < images.length;
            index += 1
        ) {
            await client.query(
                `
                    UPDATE public.page_images
                    SET sort_order = $1
                    WHERE id = $2
                `,
                [
                    -(index + 1),
                    images[index].id,
                ]
            );
        }

        for (
            let index = 0;
            index < images.length;
            index += 1
        ) {
            await client.query(
                `
                    UPDATE public.page_images
                    SET sort_order = $1
                    WHERE id = $2
                `,
                [
                    index,
                    images[index].id,
                ]
            );
        }

        await client.query("COMMIT");

        const updatedResult =
            await db.query(
                `
                    SELECT
                        id,
                        page_id,
                        image_url,
                        section,
                        sort_order
                    FROM public.page_images
                    WHERE id = $1
                    LIMIT 1
                `,
                [imageId]
            );

        return res.status(200).json({
            success: true,
            message:
                "Image order updated successfully.",
            data: {
                image:
                    updatedResult.rows[0],
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Reorder page image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to reorder page image.",
        });
    } finally {
        client.release();
    }
};

/* =========================================================
   PUBLIC PAGE IMAGES
   ========================================================= */

export const getPublicPageImages = async (
    req,
    res
) => {
    try {
        const pageName = String(
            req.params.pageName || ""
        )
            .trim()
            .toLowerCase();

        if (!pageName) {
            return res.status(400).json({
                success: false,
                message:
                    "Page name is required.",
            });
        }

        const pageResult = await db.query(
            `
                SELECT
                    id,
                    name
                FROM public.pages
                WHERE LOWER(name) = $1
                LIMIT 1
            `,
            [pageName]
        );

        if (pageResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Page was not found.",
            });
        }

        const page = pageResult.rows[0];

        const imagesResult = await db.query(
            `
                SELECT
                    id,
                    page_id,
                    image_url,
                    section,
                    sort_order
                FROM public.page_images
                WHERE page_id = $1
                ORDER BY
                    section ASC,
                    sort_order ASC,
                    id ASC
            `,
            [page.id]
        );

        const images = {
            top: [],
            middle: [],
        };

        for (const image of imagesResult.rows) {
            if (
                Object.prototype.hasOwnProperty.call(
                    images,
                    image.section
                )
            ) {
                images[image.section].push(
                    image
                );
            }
        }

        let ourStoryImage = null;

        if (pageName === ABOUT_PAGE_NAME) {
            const aboutResult =
                await db.query(
                    `
                        SELECT
                            our_story_image_url
                        FROM public.about_contents
                        WHERE id = $1
                        LIMIT 1
                    `,
                    [page.id]
                );

            if (
                aboutResult.rows.length > 0 &&
                aboutResult.rows[0]
                    .our_story_image_url
            ) {
                ourStoryImage =
                    aboutResult.rows[0]
                        .our_story_image_url;
            }
        }

        return res.status(200).json({
            success: true,

            data: {
                page,
                images,
                ourStoryImage,
            },
        });
    } catch (error) {
        console.error(
            "Get public page images error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to load page images.",
        });
    }
};