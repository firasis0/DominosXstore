import express from "express";

import shippingProviderUpload from "../Middlewares/shippingProviderUpload.middleware.js";

import {
    getGeography,
    createProvince,
    updateProvince,
    deleteProvince,
    createMunicipality,
    updateMunicipality,
    deleteMunicipality,
    getShippingProviders,
    uploadShippingProviderLogo,
    createShippingProvider,
    updateShippingProvider,
    toggleShippingProvider,
    deleteShippingProvider,
    getShippingZones,
    createShippingZone,
    updateShippingZone,
    toggleShippingZone,
    deleteShippingZone,
    getDeliveryOffices,
    createDeliveryOffice,
    updateDeliveryOffice,
    toggleDeliveryOffice,
    deleteDeliveryOffice,
} from "../Controllers/shipping.controller.js";

import {
    getPublicShippingOptions,
} from "../Controllers/publicShipping.controller.js";

const router = express.Router();

/*
 * =========================================================
 * DASHBOARD - GEOGRAPHY
 * =========================================================
 */

router.get(
    "/dashboard/shipping/geography",
    getGeography
);

/*
 * =========================================================
 * DASHBOARD - PROVINCES / WILAYAS
 * =========================================================
 */

router.post(
    "/dashboard/shipping/geography/provinces",
    createProvince
);

router.put(
    "/dashboard/shipping/geography/provinces/:id",
    updateProvince
);

router.delete(
    "/dashboard/shipping/geography/provinces/:id",
    deleteProvince
);

/*
 * =========================================================
 * DASHBOARD - MUNICIPALITIES
 * =========================================================
 */

router.post(
    "/dashboard/shipping/geography/municipalities",
    createMunicipality
);

router.put(
    "/dashboard/shipping/geography/municipalities/:id",
    updateMunicipality
);

router.delete(
    "/dashboard/shipping/geography/municipalities/:id",
    deleteMunicipality
);

/*
 * =========================================================
 * DASHBOARD - SHIPPING PROVIDERS
 * =========================================================
 */

router.post(
    "/dashboard/shipping/providers/logo",
    shippingProviderUpload.single("logo"),
    uploadShippingProviderLogo
);

router.get(
    "/dashboard/shipping/providers",
    getShippingProviders
);

router.post(
    "/dashboard/shipping/providers",
    createShippingProvider
);

router.put(
    "/dashboard/shipping/providers/:id",
    updateShippingProvider
);

router.patch(
    "/dashboard/shipping/providers/:id/toggle",
    toggleShippingProvider
);

router.delete(
    "/dashboard/shipping/providers/:id",
    deleteShippingProvider
);

/*
 * =========================================================
 * DASHBOARD - SHIPPING ZONES
 * =========================================================
 */

router.get(
    "/dashboard/shipping/zones",
    getShippingZones
);

router.post(
    "/dashboard/shipping/zones",
    createShippingZone
);

router.put(
    "/dashboard/shipping/zones/:id",
    updateShippingZone
);

router.patch(
    "/dashboard/shipping/zones/:id/toggle",
    toggleShippingZone
);

router.delete(
    "/dashboard/shipping/zones/:id",
    deleteShippingZone
);

/*
 * =========================================================
 * DASHBOARD - DELIVERY OFFICES
 * =========================================================
 */

router.get(
    "/dashboard/shipping/offices",
    getDeliveryOffices
);

router.post(
    "/dashboard/shipping/offices",
    createDeliveryOffice
);

router.put(
    "/dashboard/shipping/offices/:id",
    updateDeliveryOffice
);

router.patch(
    "/dashboard/shipping/offices/:id/toggle",
    toggleDeliveryOffice
);

router.delete(
    "/dashboard/shipping/offices/:id",
    deleteDeliveryOffice
);



router.get(
    "/shipping/options",
    getPublicShippingOptions
);

export default router;