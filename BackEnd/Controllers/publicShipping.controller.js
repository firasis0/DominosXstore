import db from "../DB/db.js";

export const getPublicGeography = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                p.id AS province_id,
                p.name AS province_name,

                m.id AS municipality_id,
                m.commune_name AS municipality_name

            FROM province p

            LEFT JOIN municipality m
                ON m.province_id = p.id

            ORDER BY
                p.id,
                m.commune_name
        `);

        const provincesMap = new Map();

        for (const row of result.rows) {
            if (!provincesMap.has(row.province_id)) {
                provincesMap.set(row.province_id, {
                    id: row.province_id,
                    name: row.province_name,
                    municipalities: [],
                });
            }

            if (row.municipality_id) {
                provincesMap
                    .get(row.province_id)
                    .municipalities.push({
                        id: row.municipality_id,
                        name: row.municipality_name,
                    });
            }
        }

        return res.status(200).json({
            success: true,
            message:
                "Public geography data fetched successfully.",
            data: Array.from(
                provincesMap.values()
            ),
        });
    } catch (error) {
        console.error(
            "Get public geography error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load geography data.",
        });
    }
};

export const getPublicShippingOptions = async (
    req,
    res
) => {
    try {
        const {
            province_id,
            municipality_id,
        } = req.query;

        if (!province_id || !municipality_id) {
            return res.status(400).json({
                success: false,
                message:
                    "province_id and municipality_id are required.",
            });
        }

        /*
         * --------------------------------------------------
         * VERIFY MUNICIPALITY
         * --------------------------------------------------
         */

        const municipalityResult =
            await db.query(
                `
                    SELECT
                        m.id,
                        m.commune_name,
                        m.province_id,
                        p.name AS province_name

                    FROM municipality m

                    INNER JOIN province p
                        ON p.id = m.province_id

                    WHERE m.id = $1
                      AND m.province_id = $2
                `,
                [
                    municipality_id,
                    province_id,
                ]
            );

        if (
            municipalityResult.rows.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid municipality for the selected province.",
            });
        }

        /*
         * --------------------------------------------------
         * GET ACTIVE SHIPPING ZONES
         * --------------------------------------------------
         *
         * A shipping zone represents:
         *
         * provider + province
         *
         * and contains:
         *
         * home_price
         * office_price
         *
         * Only active providers and active zones
         * are allowed.
         */

        const result = await db.query(
            `
                SELECT
                    sz.id AS shipping_zone_id,

                    sz.provider_id,

                    sp.name AS provider_name,

                    sp.logo_url AS provider_logo,

                    sz.province_id,

                    sz.home_price,

                    sz.office_price,

                    doff.id AS office_id,

                    doff.name AS office_name,

                    doff.address AS office_address,

                    doff.municipality_id
                        AS office_municipality_id,

                    m.commune_name
                        AS office_municipality_name

                FROM shipping_zones sz

                INNER JOIN shipping_providers sp
                    ON sp.id = sz.provider_id

                LEFT JOIN delivery_offices doff
                    ON doff.shipping_zone_id = sz.id
                    AND doff.is_active = true

                LEFT JOIN municipality m
                    ON m.id = doff.municipality_id

                WHERE sz.province_id = $1
                  AND sz.is_active = true
                  AND sp.is_active = true

                ORDER BY
                    sp.name,

                    CASE
                        WHEN doff.municipality_id = $2
                        THEN 0
                        ELSE 1
                    END,

                    doff.name
            `,
            [
                province_id,
                municipality_id,
            ]
        );

        /*
         * --------------------------------------------------
         * GROUP BY PROVIDER
         * --------------------------------------------------
         */

        const providersMap = new Map();

        for (const row of result.rows) {
            if (!providersMap.has(row.provider_id)) {
                providersMap.set(row.provider_id, {
                    provider_id:
                        row.provider_id,

                    provider_name:
                        row.provider_name,

                    provider_logo:
                        row.provider_logo,

                    shipping_zone_id:
                        row.shipping_zone_id,

                    home_price:
                        Number(
                            row.home_price
                        ),

                    office_price:
                        Number(
                            row.office_price
                        ),

                    offices: [],
                });
            }

            if (row.office_id) {
                providersMap
                    .get(row.provider_id)
                    .offices.push({
                        id: row.office_id,

                        name: row.office_name,

                        address:
                            row.office_address,

                        municipality_id:
                            row.office_municipality_id,

                        municipality_name:
                            row.office_municipality_name,

                        is_local:
                            String(
                                row.office_municipality_id
                            ) ===
                            String(
                                municipality_id
                            ),
                    });
            }
        }

        /*
         * --------------------------------------------------
         * BUILD FINAL PROVIDER DATA
         * --------------------------------------------------
         */

        const providers = [];

        for (const provider of providersMap.values()) {
            /*
             * Offices belonging to the customer's
             * selected commune.
             */

            const localOffices =
                provider.offices.filter(
                    (office) =>
                        office.is_local
                );

            /*
             * If there is an office in the selected
             * commune, use those offices first.
             *
             * Otherwise use offices belonging to the
             * same provider and same province.
             */

            const availableOffices =
                localOffices.length > 0
                    ? localOffices
                    : provider.offices;

            providers.push({
                provider_id:
                    provider.provider_id,

                provider_name:
                    provider.provider_name,

                provider_logo:
                    provider.provider_logo,

                shipping_zone_id:
                    provider.shipping_zone_id,

                home_price:
                    provider.home_price,

                office_price:
                    provider.office_price,

                home_available:
                    true,

                office_available:
                    availableOffices.length > 0,

                offices:
                    availableOffices,
            });
        }

        /*
         * --------------------------------------------------
         * RETURN REAL DATABASE DATA
         * --------------------------------------------------
         */

        return res.status(200).json({
            success: true,

            data: {
                province: {
                    id:
                        municipalityResult
                            .rows[0]
                            .province_id,

                    name:
                        municipalityResult
                            .rows[0]
                            .province_name,
                },

                municipality: {
                    id:
                        municipalityResult
                            .rows[0]
                            .id,

                    name:
                        municipalityResult
                            .rows[0]
                            .commune_name,
                },

                providers,
            },
        });
    } catch (error) {
        console.error(
            "Get public shipping options error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load shipping options.",
        });
    }
};