import express from "express";
import contentUpload from "../Middlewares/contentUpload.middleware.js";

import {
    getAboutConnect,
    getDashboardAboutConnect,
    updateDashboardAboutConnect,
    getContentPages,
    getPageContent,
    uploadPageImage,
    deletePageImage,
    reorderPageImage,
    getPublicPageImages,
    uploadOurStoryImage,
    deleteOurStoryImage,
} from "../Controllers/content.controller.js";

const router = express.Router();

/* =========================================================
   PUBLIC
   ========================================================= */

router.get(
    "/content/about/connect",
    getAboutConnect
);

router.get(
    "/content/pages/:pageName/images",
    getPublicPageImages
);

/* =========================================================
   DASHBOARD - ABOUT CONNECT
   ========================================================= */

router.get(
    "/dashboard/content/about/connect",
    getDashboardAboutConnect
);

router.put(
    "/dashboard/content/about/connect",
    updateDashboardAboutConnect
);

/* =========================================================
   DASHBOARD - PAGES
   ========================================================= */

router.get(
    "/dashboard/content/pages",
    getContentPages
);

router.get(
    "/dashboard/content/pages/:pageId",
    getPageContent
);

/* =========================================================
   DASHBOARD - PAGE IMAGES
   ========================================================= */

router.post(
    "/dashboard/content/pages/:pageId/images",
    contentUpload.single("image"),
    uploadPageImage
);

router.delete(
    "/dashboard/content/page-images/:imageId",
    deletePageImage
);

router.patch(
    "/dashboard/content/page-images/:imageId/order",
    reorderPageImage
);

/* =========================================================
   DASHBOARD - ABOUT / OUR STORY IMAGE
   ========================================================= */

router.post(
    "/dashboard/content/pages/:pageId/our-story-image",
    contentUpload.single("image"),
    uploadOurStoryImage
);

router.delete(
    "/dashboard/content/about/our-story-image",
    deleteOurStoryImage
);

export default router;