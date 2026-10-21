import path from "path";

import {
    getStoreBranding,
    updateStoreBranding,
} from "../Services/branding.service.js";

const normalizeName = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().replace(/\s+/g, " ");
};

export async function getBranding(_req, res) {
    try {
        const branding = await getStoreBranding();

        return res.status(200).json({
            success: true,
            data: { branding },
        });
    } catch (error) {
        console.error("Get store branding error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load store branding.",
        });
    }
}

export async function updateBranding(req, res) {
    try {
        const name = normalizeName(req.body.name);

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Store name is required.",
            });
        }

        if (name.length > 120) {
            return res.status(400).json({
                success: false,
                message: "Store name must be 120 characters or fewer.",
            });
        }

        const logoUrl = req.file
            ? `/uploads/content/${path.basename(req.file.path)}`
            : null;

        const branding = await updateStoreBranding({
            name,
            logoUrl,
        });

        return res.status(200).json({
            success: true,
            message: "Store branding updated successfully.",
            data: { branding },
        });
    } catch (error) {
        console.error("Update store branding error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update store branding.",
        });
    }
}
