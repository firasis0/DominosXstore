import express from "express";

import {
    getAccount,
    updateAccount,
    updatePassword,
} from "../Controllers/settings.controller.js";

const router = express.Router();

router.get(
    "/dashboard/settings/account",
    getAccount
);

router.put(
    "/dashboard/settings/account",
    updateAccount
);

router.put(
    "/dashboard/settings/password",
    updatePassword
);

export default router;