import express from "express";

import {
    getPublicGeography,
    getPublicShippingOptions,
} from "../Controllers/publicShipping.controller.js";

const router = express.Router();

router.get(
    "/shipping/geography",
    getPublicGeography
);

router.get(
    "/shipping/options",
    getPublicShippingOptions
);

export default router;