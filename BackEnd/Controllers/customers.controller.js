import db from "../DB/db.js";

const ALLOWED_ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }

    return parsed;
};

const toNonNegativeInt = (value) => {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed < 0) {
        return null;
    }

    return parsed;
};

const normalizeDeliveryType = (value) => {
    if (value === "home") {
        return "المنزل";
    }

    if (value === "office") {
        return "المكتب";
    }

    return null;
};

/**
 * GET /api/dashboard/customers
 */
export const getDashboardCustomers = async (req, res) => {
    try {
        const search = String(req.query.search || "").trim();
        const provinceId = toPositiveInt(req.query.province_id, null);

        const ordersMin =
            req.query.orders_min !== undefined
                ? toNonNegativeInt(req.query.orders_min)
                : null;

        const ordersMax =
            req.query.orders_max !== undefined
                ? toNonNegativeInt(req.query.orders_max)
                : null;

        const page = toPositiveInt(req.query.page, 1);
        const limit = Math.min(
            toPositiveInt(req.query.limit, 20),
            100
        );

        const offset = (page - 1) * limit;

        const values = [];
        const where = [];
        const having = [];

        if (provinceId !== null) {
            values.push(provinceId);

            where.push(
                `c.province_id = $${values.length}`
            );
        }

        if (ordersMin !== null) {
            values.push(ordersMin);

            having.push(
                `COUNT(o.id) >= $${values.length}`
            );
        }

        if (ordersMax !== null) {
            values.push(ordersMax);

            having.push(
                `COUNT(o.id) <= $${values.length}`
            );
        }

        const whereClause =
            where.length > 0
                ? `WHERE ${where.join(" AND ")}`
                : "";

        const havingClause =
            having.length > 0
                ? `HAVING ${having.join(" AND ")}`
                : "";

        const searchValues = [];

        if (search) {
            searchValues.push(`%${search}%`);
        }

        const searchCondition =
            search
                ? `
                    WHERE
                        full_name ILIKE $${values.length + 1}
                        OR phone_number ILIKE $${values.length + 1}
                        OR province ILIKE $${values.length + 1}
                        OR municipality ILIKE $${values.length + 1}
                `
                : "";

        if (search) {
            values.push(`%${search}%`);
        }

        values.push(limit);
        const limitParameter = values.length;

        values.push(offset);
        const offsetParameter = values.length;

        const query = `
            WITH customer_summary AS (
                SELECT
                    c.id,
                    c.full_name,
                    c.phone_number,
                    c.province,
                    c.municipality,
                    c.province_id,
                    c.municipality_id,

                    COUNT(o.id)::integer AS order_count,

                    COALESCE(
                        SUM(o.total) FILTER (
                            WHERE o.status <> 'cancelled'
                        ),
                        0
                    )::integer AS total_spent,

                    MAX(o.created_at) AS last_order_at

                FROM customers c

                LEFT JOIN orders o
                    ON o.customer_id = c.id

                ${whereClause}

                GROUP BY
                    c.id,
                    c.full_name,
                    c.phone_number,
                    c.province,
                    c.municipality,
                    c.province_id,
                    c.municipality_id

                ${havingClause}
            )

            SELECT
                *,
                COUNT(*) OVER()::integer AS total_count

            FROM customer_summary

            ${searchCondition}

            ORDER BY
                last_order_at DESC NULLS LAST,
                full_name ASC

            LIMIT $${limitParameter}
            OFFSET $${offsetParameter}
        `;

        const result = await db.query(query, values);

        const total =
            result.rows.length > 0
                ? Number(result.rows[0].total_count)
                : 0;

        const customers = result.rows.map((customer) => ({
            id: customer.id,
            full_name: customer.full_name,
            phone_number: customer.phone_number,
            province: customer.province,
            municipality: customer.municipality,
            province_id: customer.province_id,
            municipality_id: customer.municipality_id,
            order_count: Number(customer.order_count || 0),
            total_spent: Number(customer.total_spent || 0),
            last_order_at: customer.last_order_at,
        }));

        return res.status(200).json({
            success: true,
            data: customers,
            pagination: {
                page,
                limit,
                total,
                totalPages:
                    total > 0
                        ? Math.ceil(total / limit)
                        : 0,
            },
        });
    } catch (error) {
        console.error(
            "Get dashboard customers error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load customers.",
        });
    }
};

/**
 * GET /api/dashboard/customers/stats
 */
export const getDashboardCustomerStats = async (
    req,
    res
) => {
    try {
        const query = `
            SELECT
                (
                    SELECT COUNT(*)
                    FROM customers
                )::integer AS total_customers,

                (
                    SELECT COUNT(*)
                    FROM customers c
                    WHERE EXISTS (
                        SELECT 1
                        FROM orders o
                        WHERE
                            o.customer_id = c.id
                            AND o.status <> 'cancelled'
                    )
                )::integer AS active_buyers,

                (
                    SELECT COUNT(*)
                    FROM orders
                    WHERE status <> 'cancelled'
                )::integer AS total_orders,

                COALESCE(
                    (
                        SELECT SUM(total)
                        FROM orders
                        WHERE status <> 'cancelled'
                    ),
                    0
                )::integer AS total_revenue
        `;

        const result = await db.query(query);

        const stats = result.rows[0];

        return res.status(200).json({
            success: true,
            data: {
                total_customers: Number(
                    stats.total_customers || 0
                ),
                active_buyers: Number(
                    stats.active_buyers || 0
                ),
                total_orders: Number(
                    stats.total_orders || 0
                ),
                total_revenue: Number(
                    stats.total_revenue || 0
                ),
            },
        });
    } catch (error) {
        console.error(
            "Get dashboard customer stats error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load customer statistics.",
        });
    }
};

/**
 * GET /api/dashboard/customers/provinces
 */
export const getCustomerProvinces = async (
    req,
    res
) => {
    try {
        const result = await db.query(`
            SELECT
                id,
                name
            FROM province
            ORDER BY name ASC
        `);

        return res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error(
            "Get customer provinces error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load provinces.",
        });
    }
};

/**
 * GET /api/dashboard/customers/:id
 *
 * Supports customer-order filtering:
 *
 * ?order_search=
 * ?order_status=
 * ?order_delivery_type=home|office
 * ?order_date_from=YYYY-MM-DD
 * ?order_date_to=YYYY-MM-DD
 * ?order_page=1
 * ?order_limit=20
 */
export const getCustomerDetails = async (
    req,
    res
) => {
    try {
        const customerId = toPositiveInt(
            req.params.id,
            null
        );

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID.",
            });
        }

        const customerQuery = `
            SELECT
                c.id,
                c.full_name,
                c.phone_number,
                c.province,
                c.municipality,
                c.province_id,
                c.municipality_id,

                COUNT(o.id)::integer AS order_count,

                COALESCE(
                    SUM(o.total) FILTER (
                        WHERE o.status <> 'cancelled'
                    ),
                    0
                )::integer AS total_spent,

                MAX(o.created_at) AS last_order_at

            FROM customers c

            LEFT JOIN orders o
                ON o.customer_id = c.id

            WHERE c.id = $1

            GROUP BY
                c.id,
                c.full_name,
                c.phone_number,
                c.province,
                c.municipality,
                c.province_id,
                c.municipality_id
        `;

        const customerResult = await db.query(
            customerQuery,
            [customerId]
        );

        if (customerResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found.",
            });
        }

        const customer = customerResult.rows[0];

        const orderSearch = String(
            req.query.order_search || ""
        ).trim();

        const orderStatus = String(
            req.query.order_status || ""
        ).trim();

        const orderDeliveryType =
            normalizeDeliveryType(
                req.query.order_delivery_type
            );

        const orderDateFrom = String(
            req.query.order_date_from || ""
        ).trim();

        const orderDateTo = String(
            req.query.order_date_to || ""
        ).trim();

        const orderPage = toPositiveInt(
            req.query.order_page,
            1
        );

        const orderLimit = Math.min(
            toPositiveInt(
                req.query.order_limit,
                20
            ),
            100
        );

        const orderOffset =
            (orderPage - 1) * orderLimit;

        const orderValues = [customerId];

        const orderWhere = [
            "o.customer_id = $1",
        ];

        if (orderSearch) {
            orderValues.push(
                `%${orderSearch}%`
            );

            const parameter =
                orderValues.length;

            orderWhere.push(`
                (
                    o.id::text ILIKE $${parameter}
                    OR EXISTS (
                        SELECT 1
                        FROM order_items oi_search
                        INNER JOIN products p_search
                            ON p_search.id = oi_search.product_id
                        WHERE
                            oi_search.order_id = o.id
                            AND p_search.name ILIKE $${parameter}
                    )
                )
            `);
        }

        if (
            orderStatus &&
            ALLOWED_ORDER_STATUSES.includes(
                orderStatus
            )
        ) {
            orderValues.push(orderStatus);

            orderWhere.push(
                `o.status = $${orderValues.length}`
            );
        }

        if (orderDeliveryType) {
            orderValues.push(orderDeliveryType);

            orderWhere.push(
                `o.delivery_type = $${orderValues.length}`
            );
        }

        if (orderDateFrom) {
            orderValues.push(orderDateFrom);

            orderWhere.push(
                `o.created_at::date >= $${orderValues.length}::date`
            );
        }

        if (orderDateTo) {
            orderValues.push(orderDateTo);

            orderWhere.push(
                `o.created_at::date <= $${orderValues.length}::date`
            );
        }

        orderValues.push(orderLimit);
        const orderLimitParameter =
            orderValues.length;

        orderValues.push(orderOffset);
        const orderOffsetParameter =
            orderValues.length;

        const ordersQuery = `
            SELECT
                o.id,
                o.customer_id,
                o.status,
                o.total,
                o.delivery_price,
                o.delivery_type,
                o.created_at,

                sp.name AS shipping_provider_name,

                COUNT(oi.id)::integer AS item_count,

                COUNT(*) OVER()::integer AS total_count

            FROM orders o

            LEFT JOIN shipping_providers sp
                ON sp.id = o.shipping_provider_id

            LEFT JOIN order_items oi
                ON oi.order_id = o.id

            WHERE ${orderWhere.join(" AND ")}

            GROUP BY
                o.id,
                o.customer_id,
                o.status,
                o.total,
                o.delivery_price,
                o.delivery_type,
                o.created_at,
                sp.name

            ORDER BY o.created_at DESC

            LIMIT $${orderLimitParameter}
            OFFSET $${orderOffsetParameter}
        `;

        const ordersResult = await db.query(
            ordersQuery,
            orderValues
        );

        const totalOrders =
            ordersResult.rows.length > 0
                ? Number(
                    ordersResult.rows[0].total_count
                )
                : 0;

        const orders = ordersResult.rows.map(
            (order) => ({
                id: order.id,
                customer_id: order.customer_id,
                status: order.status,
                total: Number(order.total || 0),
                delivery_price: Number(
                    order.delivery_price || 0
                ),
                delivery_type:
                    order.delivery_type === "المكتب"
                        ? "office"
                        : "home",
                created_at: order.created_at,
                shipping_provider_name:
                    order.shipping_provider_name,
                item_count: Number(
                    order.item_count || 0
                ),
            })
        );

        return res.status(200).json({
            success: true,
            data: {
                customer: {
                    id: customer.id,
                    full_name: customer.full_name,
                    phone_number:
                        customer.phone_number,
                    province: customer.province,
                    municipality:
                        customer.municipality,
                    province_id:
                        customer.province_id,
                    municipality_id:
                        customer.municipality_id,
                },

                stats: {
                    order_count: Number(
                        customer.order_count || 0
                    ),
                    total_spent: Number(
                        customer.total_spent || 0
                    ),
                    last_order_at:
                        customer.last_order_at,
                },

                orders,

                pagination: {
                    page: orderPage,
                    limit: orderLimit,
                    total: totalOrders,
                    totalPages:
                        totalOrders > 0
                            ? Math.ceil(
                                totalOrders /
                                orderLimit
                            )
                            : 0,
                },
            },
        });
    } catch (error) {
        console.error(
            "Get customer details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load customer details.",
        });
    }
};

/**
 * GET /api/dashboard/customers/:id/orders/:orderId
 */
export const getCustomerOrderDetails = async (
    req,
    res
) => {
    try {
        const customerId = toPositiveInt(
            req.params.id,
            null
        );

        const orderId = toPositiveInt(
            req.params.orderId,
            null
        );

        if (!customerId || !orderId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid customer or order ID.",
            });
        }

        const orderQuery = `
            SELECT
                o.id,
                o.customer_id,
                o.status,
                o.total,
                o.created_at,
                o.delivery_type,
                o.delivery_price,

                c.full_name,
                c.phone_number,
                c.province,
                c.municipality,
                c.province_id,
                c.municipality_id,

                sp.id AS provider_id,
                sp.name AS provider_name,
                sp.logo_url AS provider_logo_url,

                sz.id AS shipping_zone_id,
                sz.office_price,
                sz.home_price,

                dof.id AS office_id,
                dof.name AS office_name,
                dof.address AS office_address,
                dof.municipality_id AS office_municipality_id,

                office_municipality.commune_name
                    AS office_municipality

            FROM orders o

            INNER JOIN customers c
                ON c.id = o.customer_id

            LEFT JOIN shipping_providers sp
                ON sp.id = o.shipping_provider_id

            LEFT JOIN shipping_zones sz
                ON sz.id = o.shipping_zone_id

            LEFT JOIN delivery_offices dof
                ON dof.id = o.delivery_office_id

            LEFT JOIN municipality office_municipality
                ON office_municipality.id =
                    dof.municipality_id

            WHERE
                o.id = $1
                AND o.customer_id = $2
        `;

        const orderResult = await db.query(
            orderQuery,
            [orderId, customerId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found for this customer.",
            });
        }

        const order = orderResult.rows[0];

        const itemsQuery = `
            SELECT
                oi.id,
                oi.order_id,
                oi.product_id,
                oi.quantity,
                oi.unit_price,
                oi.selected_variants,

                p.name AS product_name,
                p.price AS current_product_price,

                (
                    SELECT pi.image_url
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.id ASC
                    LIMIT 1
                ) AS image_url

            FROM order_items oi

            INNER JOIN products p
                ON p.id = oi.product_id

            WHERE oi.order_id = $1

            ORDER BY oi.id ASC
        `;

        const itemsResult = await db.query(
            itemsQuery,
            [orderId]
        );

        const items = itemsResult.rows.map(
            (item) => {
                const quantity = Number(
                    item.quantity || 0
                );

                const unitPrice = Number(
                    item.unit_price || 0
                );

                return {
                    id: item.id,
                    order_id: item.order_id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    image_url: item.image_url,
                    quantity,
                    unit_price: unitPrice,
                    line_total:
                        quantity * unitPrice,
                    selected_variants:
                        item.selected_variants || {},
                };
            }
        );

        const subtotal = items.reduce(
            (sum, item) =>
                sum + item.line_total,
            0
        );

        const deliveryPrice = Number(
            order.delivery_price || 0
        );

        const total = Number(
            order.total || 0
        );

        const databaseDeliveryType =
            order.delivery_type;

        const deliveryType =
            databaseDeliveryType === "المكتب"
                ? "office"
                : "home";

        const data = {
            id: order.id,
            customer_id: order.customer_id,
            status: order.status,
            total,
            created_at: order.created_at,

            customer: {
                id: order.customer_id,
                full_name: order.full_name,
                phone_number:
                    order.phone_number,
                province: order.province,
                municipality:
                    order.municipality,
                province_id:
                    order.province_id,
                municipality_id:
                    order.municipality_id,
            },

            delivery: {
                type: deliveryType,
                delivery_type: deliveryType,
                price: deliveryPrice,

                provider: order.provider_id
                    ? {
                        id: order.provider_id,
                        name: order.provider_name,
                        logo_url:
                            order.provider_logo_url,
                    }
                    : null,

                shipping_zone:
                    order.shipping_zone_id
                        ? {
                            id:
                                order.shipping_zone_id,
                            office_price: Number(
                                order.office_price ||
                                0
                            ),
                            home_price: Number(
                                order.home_price ||
                                0
                            ),
                        }
                        : null,

                office: order.office_id
                    ? {
                        id: order.office_id,
                        name:
                            order.office_name,
                        address:
                            order.office_address,
                        municipality:
                            order.office_municipality,
                        municipality_id:
                            order.office_municipality_id,
                    }
                    : null,
            },

            items,

            pricing: {
                subtotal,
                delivery: deliveryPrice,
                total,
            },
        };

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "Get customer order details error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load customer order details.",
        });
    }
};