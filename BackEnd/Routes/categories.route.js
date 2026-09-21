import express from "express";

import {
    getCategories,
    toggleCategory,
    addCategory,
    updateCategory,
    deleteCategory,
} from "../Controllers/categories.controller.js";

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

export default router;