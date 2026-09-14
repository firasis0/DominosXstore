import express from "express";

import upload from "../Middlewares/upload.middleware.js";
import categoryUpload from "../Middlewares/categoryUpload.middleware.js"
import { uploadProductImages } from "../Controllers/image.controller.js";
import { uploadCategoryImage } from "../Controllers/categories.controller.js";

const router = express.Router();

router.post(
    "/dashboard/products/images",
    upload.array("images", 10),
    uploadProductImages
);

router.post(
    "/dashboard/categories/images",
    categoryUpload.single("image"),
    uploadCategoryImage
)
export default router;