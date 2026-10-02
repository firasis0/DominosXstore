import express from "express";

import {
    getCategories,
    toggleCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
} from "../Controllers/categories.controller.js";

import categoryUpload from "../Middlewares/categoryUpload.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/categories", getCategories);

// DASHBOARD
router.get("/dashboard/categories", getCategories);

router.patch(
    "/dashboard/categories/:id/toggle",
    toggleCategory
);

router.patch(
    "/dashboard/categories/:id",
    updateCategory
);

router.post(
    "/dashboard/categories",
    addCategory
);

router.delete(
    "/dashboard/categories/:id",
    deleteCategory
);

// CATEGORY IMAGE UPLOAD
router.post(
    "/dashboard/categories/images",
    categoryUpload.single("image"),
    uploadCategoryImage
);

export default router;
