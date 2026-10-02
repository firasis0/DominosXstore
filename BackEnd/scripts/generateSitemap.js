import "dotenv/config";
import fs from "fs";
import path from "path";
import db from "../DB/db.js";

const DOMAIN = "https://dominosdz.store";

const FRONTEND_PUBLIC_DIR = path.resolve(
    "../FrontEnd/public"
);

const escapeXml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const createUrl = ({
    loc,
    changefreq,
    priority,
}) => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

try {
    console.log("Generating sitemap...");

    const productsResult = await db.query(`
        SELECT id
        FROM products
        WHERE is_active = true
        ORDER BY id;
    `);

    const categoriesResult = await db.query(`
        SELECT name
        FROM categories
        WHERE is_active = true
        ORDER BY id;
    `);

    const brandsResult = await db.query(`
        SELECT name
        FROM brands
        WHERE is_active = true
        ORDER BY id;
    `);

    const urls = [];

    // Static pages
    urls.push(
        createUrl({
            loc: `${DOMAIN}/`,
            changefreq: "daily",
            priority: "1.0",
        })
    );

    urls.push(
        createUrl({
            loc: `${DOMAIN}/shop`,
            changefreq: "daily",
            priority: "0.9",
        })
    );

    urls.push(
        createUrl({
            loc: `${DOMAIN}/categories`,
            changefreq: "weekly",
            priority: "0.8",
        })
    );

    urls.push(
        createUrl({
            loc: `${DOMAIN}/about`,
            changefreq: "monthly",
            priority: "0.7",
        })
    );

    urls.push(
        createUrl({
            loc: `${DOMAIN}/policies`,
            changefreq: "monthly",
            priority: "0.5",
        })
    );

    // Products
    for (const product of productsResult.rows) {
        urls.push(
            createUrl({
                loc: `${DOMAIN}/shop/${encodeURIComponent(
                    product.id
                )}`,
                changefreq: "weekly",
                priority: "0.8",
            })
        );
    }

    // Categories
    for (const category of categoriesResult.rows) {
        urls.push(
            createUrl({
                loc: `${DOMAIN}/categories/${encodeURIComponent(
                    category.name
                )}`,
                changefreq: "weekly",
                priority: "0.7",
            })
        );
    }

    // Brands
    for (const brand of brandsResult.rows) {
        urls.push(
            createUrl({
                loc: `${DOMAIN}/brands/${encodeURIComponent(
                    brand.name
                )}`,
                changefreq: "weekly",
                priority: "0.7",
            })
        );
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>${urls.join("\n")}
</urlset>
`;

    fs.mkdirSync(FRONTEND_PUBLIC_DIR, {
        recursive: true,
    });

    const sitemapPath = path.join(
        FRONTEND_PUBLIC_DIR,
        "sitemap.xml"
    );

    fs.writeFileSync(
        sitemapPath,
        sitemap,
        "utf8"
    );

    console.log(
        `Sitemap generated successfully: ${sitemapPath}`
    );

    console.log(
        `Total URLs: ${urls.length}`
    );

    process.exit(0);
} catch (error) {
    console.error(
        "Failed to generate sitemap:"
    );

    console.error(error);

    process.exit(1);
}
