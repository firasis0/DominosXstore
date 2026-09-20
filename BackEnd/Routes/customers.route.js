import express from "express";

import {
    getDashboardCustomers,
    getDashboardCustomerStats,
    getCustomerProvinces,
    getCustomerDetails,
    getCustomerOrderDetails,
} from "../Controllers/customers.controller.js";

const router = express.Router();

router.get(
    "/dashboard/customers/stats",
    getDashboardCustomerStats
);

router.get(
    "/dashboard/customers/provinces",
    getCustomerProvinces
);

router.get(
    "/dashboard/customers/:id/orders/:orderId",
    getCustomerOrderDetails
);

router.get(
    "/dashboard/customers/:id",
    getCustomerDetails
);

router.get(
    "/dashboard/customers",
    getDashboardCustomers
);

export default router;