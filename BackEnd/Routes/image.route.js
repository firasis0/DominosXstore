import express from "express";

import upload from "../Middlewares/upload.middleware.js";
import { uploadProductImages } from "../Controllers/image.controller.js";

const router = express.Router();

router.post(
    "/dashboard/products/images",
    upload.array("images", 10),
    uploadProductImages
);

export default router;