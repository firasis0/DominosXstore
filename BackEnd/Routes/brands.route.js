import express from "express";

import upload from "../Middlewares/brandUpload.middleware.js";

import {
    getBrands,
    toggleBrand,
    addBrand,
    updateBrand,
    deleteBrand,
    uploadBrandImage,
} from "../Controllers/brands.controller.js";

const router = express.Router();

// PUBLIC
router.get("/brands", getBrands);

// DASHBOARD
router.get("/dashboard/brands", getBrands);

router.patch(
    "/dashboard/brands/:id/toggle",
    toggleBrand
);

router.patch(
    "/dashboard/brands/:id",
    updateBrand
);

router.post(
    "/dashboard/brands",
    addBrand
);

router.post(
    "/dashboard/brands/images",
    upload.single("image"),
    uploadBrandImage
);

router.delete(
    "/dashboard/brands/:id",
    deleteBrand
);

export default router;