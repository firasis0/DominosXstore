import db from "../DB/db.js";

export const DEFAULT_BRANDING = {
    name: "DOMINOS STORE",
    logoUrl: null,
};

export async function getStoreBranding() {
    const result = await db.query(
        `
            SELECT name, logo_url
            FROM store_branding
            WHERE id = 1
        `
    );

    const row = result.rows[0];

    return {
        name: row?.name || DEFAULT_BRANDING.name,
        logoUrl: row?.logo_url || DEFAULT_BRANDING.logoUrl,
    };
}

export async function updateStoreBranding({
    name,
    logoUrl,
}) {
    const result = await db.query(
        `
            INSERT INTO store_branding (id, name, logo_url)
            VALUES (
                1,
                $1,
                COALESCE(
                    $2,
                    (SELECT logo_url FROM store_branding WHERE id = 1)
                )
            )
            ON CONFLICT (id)
            DO UPDATE SET
                name = EXCLUDED.name,
                logo_url = CASE
                    WHEN $2::text IS NULL
                    THEN store_branding.logo_url
                    ELSE EXCLUDED.logo_url
                END,
                updated_at = now()
            RETURNING name, logo_url
        `,
        [
            name,
            logoUrl ?? null,
        ]
    );

    return {
        name: result.rows[0].name,
        logoUrl: result.rows[0].logo_url,
    };
}
