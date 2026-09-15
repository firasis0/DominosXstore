import db from "../DB/db.js";

/* =========================================================
   GEOGRAPHY
========================================================= */

export const getGeography = async (req, res) => {
    try {
        const provincesResult = await db.query(`
            SELECT id, name
            FROM province
            ORDER BY id ASC;
        `);

        const municipalitiesResult = await db.query(`
            SELECT id, province_id, commune_name
            FROM municipality
            ORDER BY province_id ASC, commune_name ASC;
        `);

        return res.status(200).json({
            success: true,
            data: {
                provinces: provincesResult.rows,
                municipalities: municipalitiesResult.rows,
            },
        });
    } catch (error) {
        console.error("Error fetching geography:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching geography.",
        });
    }
};


/* =========================================================
   PROVINCES / WILAYAS
========================================================= */

export const createProvince = async (req, res) => {
    try {
        const trimmedName = req.body.name?.trim();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Wilaya name is required.",
            });
        }

        const existing = await db.query(`
            SELECT id
            FROM province
            WHERE LOWER(name) = LOWER($1)
            LIMIT 1;
        `, [trimmedName]);

        if (existing.rows.length) {
            return res.status(409).json({
                success: false,
                message: "A Wilaya with this name already exists.",
            });
        }

        const result = await db.query(`
            INSERT INTO province (name)
            VALUES ($1)
            RETURNING id, name;
        `, [trimmedName]);

        return res.status(201).json({
            success: true,
            message: "Wilaya added successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error creating province:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while adding Wilaya.",
        });
    }
};


export const updateProvince = async (req, res) => {
    try {
        const { id } = req.params;
        const trimmedName = req.body.name?.trim();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Wilaya name is required.",
            });
        }

        const existing = await db.query(`
            SELECT id
            FROM province
            WHERE LOWER(name) = LOWER($1)
              AND id <> $2
            LIMIT 1;
        `, [trimmedName, id]);

        if (existing.rows.length) {
            return res.status(409).json({
                success: false,
                message: "A Wilaya with this name already exists.",
            });
        }

        const result = await db.query(`
            UPDATE province
            SET name = $1
            WHERE id = $2
            RETURNING id, name;
        `, [trimmedName, id]);

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Wilaya not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Wilaya updated successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating province:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating Wilaya.",
        });
    }
};


export const deleteProvince = async (req, res) => {
    try {
        const { id } = req.params;

        const municipalityCheck = await db.query(`
            SELECT COUNT(*)::int AS count
            FROM municipality
            WHERE province_id = $1;
        `, [id]);

        if (municipalityCheck.rows[0].count > 0) {
            const count = municipalityCheck.rows[0].count;

            return res.status(409).json({
                success: false,
                message: `Cannot remove this Wilaya because it has ${count} municipality${count > 1 ? "ies" : "y"} attached to it. Remove the municipalities first.`,
            });
        }

        const zoneCheck = await db.query(`
            SELECT COUNT(*)::int AS count
            FROM shipping_zones
            WHERE province_id = $1;
        `, [id]);

        if (zoneCheck.rows[0].count > 0) {
            const count = zoneCheck.rows[0].count;

            return res.status(409).json({
                success: false,
                message: `Cannot remove this Wilaya because it is used by ${count} shipping zone${count > 1 ? "s" : ""}.`,
            });
        }

        const result = await db.query(`
            DELETE FROM province
            WHERE id = $1
            RETURNING id, name;
        `, [id]);

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Wilaya not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Wilaya removed successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error deleting province:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while removing Wilaya.",
        });
    }
};


/* =========================================================
   MUNICIPALITIES
========================================================= */

export const createMunicipality = async (req, res) => {
    try {
        const { province_id, commune_name } = req.body;
        const trimmedName = commune_name?.trim();

        if (!province_id) {
            return res.status(400).json({
                success: false,
                message: "Province is required.",
            });
        }

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Municipality name is required.",
            });
        }

        const province = await db.query(
            `SELECT id FROM province WHERE id = $1;`,
            [province_id]
        );

        if (!province.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Wilaya not found.",
            });
        }

        const duplicate = await db.query(`
            SELECT id
            FROM municipality
            WHERE province_id = $1
              AND LOWER(commune_name) = LOWER($2)
            LIMIT 1;
        `, [province_id, trimmedName]);

        if (duplicate.rows.length) {
            return res.status(409).json({
                success: false,
                message: "A municipality with this name already exists in this Wilaya.",
            });
        }

        const result = await db.query(`
            INSERT INTO municipality (province_id, commune_name)
            VALUES ($1, $2)
            RETURNING id, province_id, commune_name;
        `, [province_id, trimmedName]);

        return res.status(201).json({
            success: true,
            message: "Municipality added successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error creating municipality:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while adding municipality.",
        });
    }
};


export const updateMunicipality = async (req, res) => {
    try {
        const { id } = req.params;
        const { province_id, commune_name } = req.body;
        const trimmedName = commune_name?.trim();

        if (!province_id) {
            return res.status(400).json({
                success: false,
                message: "Province is required.",
            });
        }

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Municipality name is required.",
            });
        }

        const province = await db.query(
            `SELECT id FROM province WHERE id = $1;`,
            [province_id]
        );

        if (!province.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Wilaya not found.",
            });
        }

        const duplicate = await db.query(`
            SELECT id
            FROM municipality
            WHERE province_id = $1
              AND LOWER(commune_name) = LOWER($2)
              AND id <> $3
            LIMIT 1;
        `, [province_id, trimmedName, id]);

        if (duplicate.rows.length) {
            return res.status(409).json({
                success: false,
                message: "A municipality with this name already exists in this Wilaya.",
            });
        }

        const result = await db.query(`
            UPDATE municipality
            SET province_id = $1,
                commune_name = $2
            WHERE id = $3
            RETURNING id, province_id, commune_name;
        `, [province_id, trimmedName, id]);

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Municipality not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Municipality updated successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating municipality:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating municipality.",
        });
    }
};


export const deleteMunicipality = async (req, res) => {
    try {
        const { id } = req.params;

        const offices = await db.query(`
            SELECT COUNT(*)::int AS count
            FROM delivery_offices
            WHERE municipality_id = $1;
        `, [id]);

        if (offices.rows[0].count > 0) {
            const count = offices.rows[0].count;

            return res.status(409).json({
                success: false,
                message: `Cannot remove this municipality because it has ${count} delivery office${count > 1 ? "s" : ""} attached to it. Remove the offices first.`,
            });
        }

        const result = await db.query(`
            DELETE FROM municipality
            WHERE id = $1
            RETURNING id, province_id, commune_name;
        `, [id]);

        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Municipality not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Municipality removed successfully.",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error deleting municipality:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while removing municipality.",
        });
    }
};


/* =========================================================
   SHIPPING PROVIDERS
========================================================= */

export const getShippingProviders = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT
                sp.id,
                sp.name,
                sp.logo_url,
                sp.is_active,
                COUNT(DISTINCT sz.id)::int AS zone_count,
                COUNT(DISTINCT dof.id)::int AS office_count
            FROM shipping_providers sp
            LEFT JOIN shipping_zones sz
                ON sz.provider_id = sp.id
            LEFT JOIN delivery_offices dof
                ON dof.shipping_zone_id = sz.id
            GROUP BY
                sp.id,
                sp.name,
                sp.logo_url,
                sp.is_active
            ORDER BY sp.id ASC;
        `);

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows,
        });
    } catch (error) {
        console.error("Error fetching shipping providers:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching shipping providers.",
        });
    }
};


export const createShippingProvider = async (req, res) => {
    try {
        const { name, logo_url } = req.body;
        const trimmedName = name?.trim();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Provider name is required.",
            });
        }

        const { rows } = await db.query(`
            INSERT INTO shipping_providers (
                name,
                logo_url,
                is_active
            )
            VALUES ($1, $2, true)
            RETURNING id, name, logo_url, is_active;
        `, [
            trimmedName,
            logo_url || null,
        ]);

        return res.status(201).json({
            success: true,
            message: "Shipping provider created successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error creating shipping provider:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "A shipping provider with this name already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while creating shipping provider.",
        });
    }
};


export const updateShippingProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, logo_url } = req.body;
        const trimmedName = name?.trim();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Provider name is required.",
            });
        }

        const { rows } = await db.query(`
            UPDATE shipping_providers
            SET name = $1,
                logo_url = $2
            WHERE id = $3
            RETURNING id, name, logo_url, is_active;
        `, [
            trimmedName,
            logo_url || null,
            id,
        ]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Shipping provider not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Shipping provider updated successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error updating shipping provider:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "A shipping provider with this name already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while updating shipping provider.",
        });
    }
};


export const toggleShippingProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_active must be a boolean.",
            });
        }

        const { rows } = await db.query(`
            UPDATE shipping_providers
            SET is_active = $1
            WHERE id = $2
            RETURNING id, name, logo_url, is_active;
        `, [
            is_active,
            id,
        ]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Shipping provider not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Shipping provider status updated successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error toggling shipping provider:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating shipping provider status.",
        });
    }
};


export const deleteShippingProvider = async (req, res) => {
    try {
        const { id } = req.params;

        const zoneCheck = await db.query(`
            SELECT COUNT(*)::int AS count
            FROM shipping_zones
            WHERE provider_id = $1;
        `, [id]);

        const zoneCount = zoneCheck.rows[0].count;

        if (zoneCount > 0) {
            return res.status(409).json({
                success: false,
                message: `This provider cannot be deleted because it has ${zoneCount} shipping zone${zoneCount > 1 ? "s" : ""}. Remove its coverage first.`,
            });
        }

        const { rows } = await db.query(`
            DELETE FROM shipping_providers
            WHERE id = $1
            RETURNING id;
        `, [id]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Shipping provider not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Shipping provider deleted successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error deleting shipping provider:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting shipping provider.",
        });
    }
};


/* =========================================================
   SHIPPING ZONES
========================================================= */

export const getShippingZones = async (req, res) => {
    try {
        const values = [];
        const conditions = [];

        if (req.query.provider_id) {
            values.push(req.query.provider_id);
            conditions.push(`sz.provider_id = $${values.length}`);
        }

        const where = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const { rows } = await db.query(`
            SELECT
                sz.id,
                sz.provider_id,
                sz.province_id,
                sz.office_price,
                sz.home_price,
                sz.is_active,
                sp.name AS provider_name,
                p.name AS province_name
            FROM shipping_zones sz
            INNER JOIN shipping_providers sp
                ON sp.id = sz.provider_id
            INNER JOIN province p
                ON p.id = sz.province_id
            ${where}
            ORDER BY p.id ASC, sz.id ASC;
        `, values);

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows,
        });
    } catch (error) {
        console.error("Error fetching shipping zones:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching shipping zones.",
        });
    }
};


export const createShippingZone = async (req, res) => {
    try {
        const {
            provider_id,
            province_id,
            office_price = 0,
            home_price = 0,
        } = req.body;

        if (!provider_id || !province_id) {
            return res.status(400).json({
                success: false,
                message: "Provider and Wilaya are required.",
            });
        }

        const officePrice = Number(office_price);
        const homePrice = Number(home_price);

        if (
            !Number.isFinite(officePrice) ||
            officePrice < 0 ||
            !Number.isFinite(homePrice) ||
            homePrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Shipping prices must be valid non-negative numbers.",
            });
        }

        const provider = await db.query(
            `SELECT id FROM shipping_providers WHERE id = $1;`,
            [provider_id]
        );

        if (!provider.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Shipping provider not found.",
            });
        }

        const province = await db.query(
            `SELECT id FROM province WHERE id = $1;`,
            [province_id]
        );

        if (!province.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Wilaya not found.",
            });
        }

        const { rows } = await db.query(`
            INSERT INTO shipping_zones (
                provider_id,
                province_id,
                office_price,
                home_price,
                is_active
            )
            VALUES ($1, $2, $3, $4, true)
            RETURNING
                id,
                provider_id,
                province_id,
                office_price,
                home_price,
                is_active;
        `, [
            provider_id,
            province_id,
            officePrice,
            homePrice,
        ]);

        return res.status(201).json({
            success: true,
            message: "Shipping coverage added successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error creating shipping zone:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This provider already has coverage for this Wilaya.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while adding shipping coverage.",
        });
    }
};


export const updateShippingZone = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            provider_id,
            province_id,
            office_price,
            home_price,
        } = req.body;

        const current = await db.query(`
            SELECT
                provider_id,
                province_id,
                office_price,
                home_price
            FROM shipping_zones
            WHERE id = $1;
        `, [id]);

        if (!current.rows.length) {
            return res.status(404).json({
                success: false,
                message: "Shipping zone not found.",
            });
        }

        const row = current.rows[0];

        const nextProviderId =
            provider_id ?? row.provider_id;

        const nextProvinceId =
            province_id ?? row.province_id;

        const nextOfficePrice =
            office_price === undefined
                ? row.office_price
                : Number(office_price);

        const nextHomePrice =
            home_price === undefined
                ? row.home_price
                : Number(home_price);

        if (
            !Number.isFinite(nextOfficePrice) ||
            nextOfficePrice < 0 ||
            !Number.isFinite(nextHomePrice) ||
            nextHomePrice < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Shipping prices must be valid non-negative numbers.",
            });
        }

        const { rows } = await db.query(`
            UPDATE shipping_zones
            SET provider_id = $1,
                province_id = $2,
                office_price = $3,
                home_price = $4
            WHERE id = $5
            RETURNING
                id,
                provider_id,
                province_id,
                office_price,
                home_price,
                is_active;
        `, [
            nextProviderId,
            nextProvinceId,
            nextOfficePrice,
            nextHomePrice,
            id,
        ]);

        return res.status(200).json({
            success: true,
            message: "Shipping zone updated successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error updating shipping zone:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This provider already has coverage for this Wilaya.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while updating shipping zone.",
        });
    }
};


export const toggleShippingZone = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_active must be a boolean.",
            });
        }

        const { rows } = await db.query(`
            UPDATE shipping_zones
            SET is_active = $1
            WHERE id = $2
            RETURNING
                id,
                provider_id,
                province_id,
                office_price,
                home_price,
                is_active;
        `, [
            is_active,
            id,
        ]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Shipping zone not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Shipping zone status updated successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error toggling shipping zone:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating shipping zone status.",
        });
    }
};


export const deleteShippingZone = async (req, res) => {
    try {
        const { id } = req.params;

        const officeCheck = await db.query(`
            SELECT COUNT(*)::int AS count
            FROM delivery_offices
            WHERE shipping_zone_id = $1;
        `, [id]);

        const officeCount = officeCheck.rows[0].count;

        if (officeCount > 0) {
            return res.status(409).json({
                success: false,
                message: `This shipping zone cannot be deleted because it has ${officeCount} delivery office${officeCount > 1 ? "s" : ""}. Remove the offices first.`,
            });
        }

        const { rows } = await db.query(`
            DELETE FROM shipping_zones
            WHERE id = $1
            RETURNING id;
        `, [id]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Shipping zone not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Shipping zone deleted successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error deleting shipping zone:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting shipping zone.",
        });
    }
};


/* =========================================================
   DELIVERY OFFICES
========================================================= */

export const getDeliveryOffices = async (req, res) => {
    try {
        const values = [];
        const conditions = [];

        if (req.query.provider_id) {
            values.push(req.query.provider_id);
            conditions.push(`sz.provider_id = $${values.length}`);
        }

        if (req.query.shipping_zone_id) {
            values.push(req.query.shipping_zone_id);
            conditions.push(`dof.shipping_zone_id = $${values.length}`);
        }

        const where = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const { rows } = await db.query(`
            SELECT
                dof.id,
                dof.shipping_zone_id,
                dof.municipality_id,
                dof.name,
                dof.address,
                dof.is_active,
                sz.provider_id,
                sz.province_id,
                m.commune_name AS municipality_name,
                p.name AS province_name
            FROM delivery_offices dof
            INNER JOIN shipping_zones sz
                ON sz.id = dof.shipping_zone_id
            INNER JOIN municipality m
                ON m.id = dof.municipality_id
            INNER JOIN province p
                ON p.id = m.province_id
            ${where}
            ORDER BY
                p.id ASC,
                m.commune_name ASC,
                dof.name ASC;
        `, values);

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows,
        });
    } catch (error) {
        console.error("Error fetching delivery offices:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching delivery offices.",
        });
    }
};


const validateOfficeRelations = async (
    shipping_zone_id,
    municipality_id
) => {
    const zone = await db.query(`
        SELECT id, province_id
        FROM shipping_zones
        WHERE id = $1;
    `, [shipping_zone_id]);

    if (!zone.rows.length) {
        return {
            error: "Shipping zone not found.",
            status: 404,
        };
    }

    const municipality = await db.query(`
        SELECT id, province_id
        FROM municipality
        WHERE id = $1;
    `, [municipality_id]);

    if (!municipality.rows.length) {
        return {
            error: "Municipality not found.",
            status: 404,
        };
    }

    if (
        municipality.rows[0].province_id !==
        zone.rows[0].province_id
    ) {
        return {
            error: "The municipality must belong to the shipping zone's Wilaya.",
            status: 400,
        };
    }

    return null;
};


export const createDeliveryOffice = async (req, res) => {
    try {
        const {
            shipping_zone_id,
            municipality_id,
            name,
            address,
        } = req.body;

        if (!shipping_zone_id || !municipality_id) {
            return res.status(400).json({
                success: false,
                message: "Shipping zone and municipality are required.",
            });
        }

        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Delivery office name is required.",
            });
        }

        const relationError =
            await validateOfficeRelations(
                shipping_zone_id,
                municipality_id
            );

        if (relationError) {
            return res.status(relationError.status).json({
                success: false,
                message: relationError.error,
            });
        }

        const { rows } = await db.query(`
            INSERT INTO delivery_offices (
                shipping_zone_id,
                municipality_id,
                name,
                address,
                is_active
            )
            VALUES ($1, $2, $3, $4, true)
            RETURNING
                id,
                shipping_zone_id,
                municipality_id,
                name,
                address,
                is_active;
        `, [
            shipping_zone_id,
            municipality_id,
            name.trim(),
            address?.trim() || null,
        ]);

        return res.status(201).json({
            success: true,
            message: "Delivery office added successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error creating delivery office:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while adding delivery office.",
        });
    }
};


export const updateDeliveryOffice = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            shipping_zone_id,
            municipality_id,
            name,
            address,
        } = req.body;

        if (!shipping_zone_id || !municipality_id) {
            return res.status(400).json({
                success: false,
                message: "Shipping zone and municipality are required.",
            });
        }

        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Delivery office name is required.",
            });
        }

        const relationError =
            await validateOfficeRelations(
                shipping_zone_id,
                municipality_id
            );

        if (relationError) {
            return res.status(relationError.status).json({
                success: false,
                message: relationError.error,
            });
        }

        const { rows } = await db.query(`
            UPDATE delivery_offices
            SET shipping_zone_id = $1,
                municipality_id = $2,
                name = $3,
                address = $4
            WHERE id = $5
            RETURNING
                id,
                shipping_zone_id,
                municipality_id,
                name,
                address,
                is_active;
        `, [
            shipping_zone_id,
            municipality_id,
            name.trim(),
            address?.trim() || null,
            id,
        ]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Delivery office not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Delivery office updated successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error updating delivery office:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating delivery office.",
        });
    }
};


export const toggleDeliveryOffice = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (typeof is_active !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "is_active must be a boolean.",
            });
        }

        const { rows } = await db.query(`
            UPDATE delivery_offices
            SET is_active = $1
            WHERE id = $2
            RETURNING
                id,
                shipping_zone_id,
                municipality_id,
                name,
                address,
                is_active;
        `, [
            is_active,
            id,
        ]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Delivery office not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Delivery office status updated successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error toggling delivery office:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating delivery office status.",
        });
    }
};


export const deleteDeliveryOffice = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await db.query(`
            DELETE FROM delivery_offices
            WHERE id = $1
            RETURNING id;
        `, [id]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Delivery office not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Delivery office deleted successfully.",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error deleting delivery office:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting delivery office.",
        });
    }
};