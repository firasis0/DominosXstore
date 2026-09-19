import db from "../DB/db.js";

const ALLOWED_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

const TERMINAL_STATUSES = [
    "delivered",
    "cancelled",
];

/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

export const createOrder = async (req, res) => {
    const client = await db.connect();

    try {
        const {
            product_id,
            quantity,
            customer: customerInput,
            province_id,
            municipality_id,
            delivery_type,
            shipping_provider_id,
            shipping_zone_id,
            delivery_office_id,
            variants,
        } = req.body;

        const productId = Number(product_id);
        const orderQuantity = Number(quantity);
        const provinceId = Number(province_id);
        const municipalityId = Number(municipality_id);
        const providerId = Number(shipping_provider_id);
        const zoneId = Number(shipping_zone_id);

        const fullName = String(
            customerInput?.full_name ?? ""
        ).trim();

        const phone = String(
            customerInput?.phone ?? ""
        ).trim();

        /*
        |--------------------------------------------------------------------------
        | Basic validation
        |--------------------------------------------------------------------------
        */

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product.",
            });
        }

        if (
            !Number.isInteger(orderQuantity) ||
            orderQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity.",
            });
        }

        if (!fullName) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer name is required.",
            });
        }

        if (!phone) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer phone is required.",
            });
        }

        if (
            !Number.isInteger(provinceId) ||
            provinceId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid province.",
            });
        }

        if (
            !Number.isInteger(municipalityId) ||
            municipalityId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid municipality.",
            });
        }

        if (
            !["home", "office"].includes(
                delivery_type
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Delivery type must be home or office.",
            });
        }

        if (
            !Number.isInteger(providerId) ||
            providerId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid shipping provider.",
            });
        }

        if (
            !Number.isInteger(zoneId) ||
            zoneId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid shipping zone.",
            });
        }

        const officeId =
            delivery_type === "office"
                ? Number(delivery_office_id)
                : null;

        if (
            delivery_type === "office" &&
            (!Number.isInteger(officeId) ||
                officeId <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "A delivery office is required for office delivery.",
            });
        }

        const requestedVariants =
            variants &&
            typeof variants === "object" &&
            !Array.isArray(variants)
                ? variants
                : {};

        /*
        |--------------------------------------------------------------------------
        | Start transaction
        |--------------------------------------------------------------------------
        */

        await client.query("BEGIN");

        /*
        |--------------------------------------------------------------------------
        | Product
        |--------------------------------------------------------------------------
        */

        const productResult =
            await client.query(
                `
                    SELECT
                        id,
                        name,
                        price,
                        discount_price,
                        is_on_sale,
                        stock,
                        is_active
                    FROM products
                    WHERE id = $1
                    FOR UPDATE;
                `,
                [productId]
            );

        if (!productResult.rows.length) {
            const error = new Error(
                "Product not found."
            );

            error.statusCode = 404;
            throw error;
        }

        const product =
            productResult.rows[0];

        if (!product.is_active) {
            const error = new Error(
                "This product is no longer available."
            );

            error.statusCode = 400;
            throw error;
        }

        if (
            Number(product.stock) <
            orderQuantity
        ) {
            const error = new Error(
                "Not enough stock available."
            );

            error.statusCode = 409;
            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Authoritative product price
        |--------------------------------------------------------------------------
        */

        const productPrice =
            product.is_on_sale &&
            product.discount_price !== null
                ? Number(
                      product.discount_price
                  )
                : Number(product.price);

        if (
            !Number.isFinite(
                productPrice
            )
        ) {
            const error = new Error(
                "Product price is invalid."
            );

            error.statusCode = 500;
            throw error;
        }

        /*
        |--------------------------------------------------------------------------
        | Validate geography
        |--------------------------------------------------------------------------
        */

        const geographyResult =
            await client.query(
                `
                    SELECT
                        p.id AS province_id,
                        p.name AS province_name,
                        m.id AS municipality_id,
                        m.commune_name AS municipality_name
                    FROM province p
                    INNER JOIN municipality m
                        ON m.province_id = p.id
                    WHERE p.id = $1
                      AND m.id = $2;
                `,
                [
                    provinceId,
                    municipalityId,
                ]
            );

        if (
            !geographyResult.rows.length
        ) {
            const error = new Error(
                "The selected municipality does not belong to the selected province."
            );

            error.statusCode = 400;
            throw error;
        }

        const geography =
            geographyResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Validate shipping provider + zone
        |--------------------------------------------------------------------------
        */

        const shippingResult =
            await client.query(
                `
                    SELECT
                        sp.id AS provider_id,
                        sp.name AS provider_name,
                        sp.logo_url AS provider_logo,

                        sz.id AS shipping_zone_id,
                        sz.home_price,
                        sz.office_price

                    FROM shipping_providers sp

                    INNER JOIN shipping_zones sz
                        ON sz.provider_id = sp.id

                    WHERE sp.id = $1
                      AND sz.id = $2
                      AND sz.province_id = $3
                      AND sp.is_active = true
                      AND sz.is_active = true;
                `,
                [
                    providerId,
                    zoneId,
                    provinceId,
                ]
            );

        if (
            !shippingResult.rows.length
        ) {
            const error = new Error(
                "The selected shipping provider is not available for this province."
            );

            error.statusCode = 400;
            throw error;
        }

        const shipping =
            shippingResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Delivery price + office validation
        |--------------------------------------------------------------------------
        */

        let deliveryPrice;

        if (delivery_type === "home") {
            deliveryPrice = Number(
                shipping.home_price
            );

            if (
                !Number.isFinite(
                    deliveryPrice
                )
            ) {
                const error = new Error(
                    "Home delivery is not available for this provider."
                );

                error.statusCode = 400;
                throw error;
            }
        } else {
            deliveryPrice = Number(
                shipping.office_price
            );

            if (
                !Number.isFinite(
                    deliveryPrice
                )
            ) {
                const error = new Error(
                    "Office delivery is not available for this provider."
                );

                error.statusCode = 400;
                throw error;
            }

            /*
            |--------------------------------------------------------------------------
            | Office can be anywhere inside selected province
            |--------------------------------------------------------------------------
            */

            const officeResult =
                await client.query(
                    `
                        SELECT
                            dof.id,
                            dof.name,
                            dof.address,
                            dof.municipality_id,
                            m.commune_name AS municipality_name

                        FROM delivery_offices dof

                        INNER JOIN municipality m
                            ON m.id =
                                dof.municipality_id

                        WHERE dof.id = $1
                          AND dof.shipping_zone_id = $2
                          AND dof.is_active = true
                          AND m.province_id = $3;
                    `,
                    [
                        officeId,
                        zoneId,
                        provinceId,
                    ]
                );

            if (
                !officeResult.rows.length
            ) {
                const error = new Error(
                    "The selected delivery office is not available in the selected province."
                );

                error.statusCode = 400;
                throw error;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Validate product variants
        |--------------------------------------------------------------------------
        */

        const variantResult =
            await client.query(
                `
                    SELECT
                        id,
                        type,
                        value,
                        color_hex
                    FROM product_variants
                    WHERE product_id = $1
                    ORDER BY id ASC;
                `,
                [productId]
            );

        const availableVariants =
            variantResult.rows;

        const variantsByType = {};

        for (
            const variant of
                availableVariants
        ) {
            if (
                !variantsByType[
                    variant.type
                ]
            ) {
                variantsByType[
                    variant.type
                ] = [];
            }

            variantsByType[
                variant.type
            ].push(variant);
        }

        const selectedVariants = {};

        for (
            const [type, options] of
                Object.entries(
                    variantsByType
                )
        ) {
            const submittedVariant =
                requestedVariants[type];

            if (
                submittedVariant ===
                    undefined ||
                submittedVariant === null ||
                submittedVariant === ""
            ) {
                if (
                    options.length === 1
                ) {
                    const selected =
                        options[0];

                    selectedVariants[
                        type
                    ] = {
                        id: selected.id,
                        value:
                            selected.value,
                        color_hex:
                            selected.color_hex,
                    };

                    continue;
                }

                if (
                    options.length > 1
                ) {
                    const error =
                        new Error(
                            `Please select a ${type} variant.`
                        );

                    error.statusCode = 400;
                    throw error;
                }

                continue;
            }

            let submittedId = null;
            let submittedValue = null;

            if (
                typeof submittedVariant ===
                    "object" &&
                !Array.isArray(
                    submittedVariant
                )
            ) {
                if (
                    submittedVariant.id !==
                        undefined &&
                    submittedVariant.id !==
                        null
                ) {
                    const parsedId =
                        Number(
                            submittedVariant.id
                        );

                    if (
                        Number.isInteger(
                            parsedId
                        )
                    ) {
                        submittedId =
                            parsedId;
                    }
                }

                if (
                    submittedVariant.value !==
                        undefined &&
                    submittedVariant.value !==
                        null
                ) {
                    submittedValue =
                        String(
                            submittedVariant.value
                        ).trim();
                }
            } else if (
                typeof submittedVariant ===
                "number"
            ) {
                submittedId =
                    Number(
                        submittedVariant
                    );
            } else if (
                typeof submittedVariant ===
                "string"
            ) {
                const trimmedValue =
                    submittedVariant.trim();

                if (
                    /^\d+$/.test(
                        trimmedValue
                    )
                ) {
                    submittedId =
                        Number(
                            trimmedValue
                        );
                } else {
                    submittedValue =
                        trimmedValue;
                }
            }

            let selected = null;

            if (
                submittedId !== null
            ) {
                selected =
                    options.find(
                        (option) =>
                            Number(
                                option.id
                            ) ===
                            submittedId
                    );
            }

            if (
                !selected &&
                submittedValue
            ) {
                selected =
                    options.find(
                        (option) =>
                            String(
                                option.value
                            ).trim() ===
                            submittedValue
                    );
            }

            if (!selected) {
                const error = new Error(
                    `Invalid ${type} variant.`
                );

                error.statusCode = 400;
                throw error;
            }

            selectedVariants[type] =
                {
                    id: selected.id,
                    value:
                        selected.value,
                    color_hex:
                        selected.color_hex,
                };
        }

        /*
        |--------------------------------------------------------------------------
        | Create / update customer
        |--------------------------------------------------------------------------
        */

        const customerResult =
            await client.query(
                `
                    INSERT INTO customers (
                        full_name,
                        province,
                        municipality,
                        phone_number,
                        province_id,
                        municipality_id
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
                    )

                    ON CONFLICT (
                        phone_number
                    )
                    DO UPDATE SET
                        full_name =
                            EXCLUDED.full_name,
                        province =
                            EXCLUDED.province,
                        municipality =
                            EXCLUDED.municipality,
                        province_id =
                            EXCLUDED.province_id,
                        municipality_id =
                            EXCLUDED.municipality_id

                    RETURNING
                        id,
                        full_name,
                        phone_number,
                        province,
                        municipality,
                        province_id,
                        municipality_id;
                `,
                [
                    fullName,
                    geography.province_name,
                    geography.municipality_name,
                    phone,
                    provinceId,
                    municipalityId,
                ]
            );

        const customer =
            customerResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Atomically reduce stock
        |--------------------------------------------------------------------------
        */

        const stockResult =
            await client.query(
                `
                    UPDATE products
                    SET stock =
                        stock - $1
                    WHERE id = $2
                      AND is_active = true
                      AND stock >= $1
                    RETURNING stock;
                `,
                [
                    orderQuantity,
                    productId,
                ]
            );

        if (
            !stockResult.rows.length
        ) {
            const error = new Error(
                "Not enough stock available."
            );

            error.statusCode = 409;
            throw error;
        }

        const remainingStock =
            Number(
                stockResult.rows[0].stock
            );

        /*
        |--------------------------------------------------------------------------
        | Calculate totals
        |--------------------------------------------------------------------------
        */

        const subtotal =
            productPrice *
            orderQuantity;

        const total =
            subtotal +
            deliveryPrice;

        /*
        |--------------------------------------------------------------------------
        | Database delivery type
        |--------------------------------------------------------------------------
        */

        const databaseDeliveryType =
            delivery_type === "office"
                ? "المكتب"
                : "المنزل";

        /*
        |--------------------------------------------------------------------------
        | Create order
        |--------------------------------------------------------------------------
        */

        const orderResult =
            await client.query(
                `
                    INSERT INTO orders (
                        customer_id,
                        status,
                        total,
                        delivery_type,
                        delivery_price,
                        shipping_provider_id,
                        shipping_zone_id,
                        delivery_office_id
                    )
                    VALUES (
                        $1,
                        'pending',
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7
                    )
                    RETURNING
                        id,
                        customer_id,
                        status,
                        total,
                        delivery_type,
                        delivery_price,
                        shipping_provider_id,
                        shipping_zone_id,
                        delivery_office_id,
                        created_at;
                `,
                [
                    customer.id,
                    total,
                    databaseDeliveryType,
                    deliveryPrice,
                    providerId,
                    zoneId,
                    delivery_type ===
                    "office"
                        ? officeId
                        : null,
                ]
            );

        const order =
            orderResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Create order item
        |--------------------------------------------------------------------------
        */

        const orderItemResult =
            await client.query(
                `
                    INSERT INTO order_items (
                        order_id,
                        product_id,
                        quantity,
                        unit_price,
                        selected_variants
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5::jsonb
                    )
                    RETURNING
                        id,
                        order_id,
                        product_id,
                        quantity,
                        unit_price,
                        selected_variants;
                `,
                [
                    order.id,
                    productId,
                    orderQuantity,
                    productPrice,
                    JSON.stringify(
                        selectedVariants
                    ),
                ]
            );

        await client.query("COMMIT");

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return res.status(201).json({
            success: true,
            message:
                "Order created successfully.",

            data: {
                order: {
                    ...order,
                    subtotal,
                    total,
                },

                customer,

                item:
                    orderItemResult.rows[0],

                product: {
                    id: product.id,
                    name: product.name,
                    unit_price:
                        productPrice,
                    quantity:
                        orderQuantity,
                    subtotal,
                    remaining_stock:
                        remainingStock,
                },

                shipping: {
                    provider_id:
                        shipping.provider_id,

                    provider_name:
                        shipping.provider_name,

                    provider_logo:
                        shipping.provider_logo,

                    shipping_zone_id:
                        shipping.shipping_zone_id,

                    delivery_type,

                    delivery_price:
                        deliveryPrice,

                    delivery_office_id:
                        delivery_type ===
                        "office"
                            ? officeId
                            : null,
                },
            },
        });
    } catch (error) {
        try {
            await client.query(
                "ROLLBACK"
            );
        } catch (rollbackError) {
            console.error(
                "Rollback error:",
                rollbackError
            );
        }

        console.error(
            "Error creating order:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Server error while creating order.",
        });
    } finally {
        client.release();
    }
};

/*
|--------------------------------------------------------------------------
| Dashboard Orders
|--------------------------------------------------------------------------
*/

export const getDashboardOrders = async (
    req,
    res
) => {
    try {
        const result =
            await db.query(`
                SELECT
                    o.id,
                    o.status,
                    o.total,
                    o.delivery_price,
                    o.delivery_type,
                    o.created_at,

                    c.full_name
                        AS customer_name,
                    c.phone_number
                        AS customer_phone,
                    c.province,
                    c.municipality,

                    sp.name
                        AS shipping_provider_name,

                    COUNT(oi.id)::int
                        AS item_count

                FROM orders o

                LEFT JOIN customers c
                    ON c.id =
                        o.customer_id

                LEFT JOIN shipping_providers sp
                    ON sp.id =
                        o.shipping_provider_id

                LEFT JOIN order_items oi
                    ON oi.order_id =
                        o.id

                GROUP BY
                    o.id,
                    c.full_name,
                    c.phone_number,
                    c.province,
                    c.municipality,
                    sp.name

                ORDER BY
                    o.created_at DESC;
            `);

        return res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error(
            "Error fetching dashboard orders:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch dashboard orders.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Order Stats
|--------------------------------------------------------------------------
*/

export const getOrderStats = async (
    req,
    res
) => {
    try {
        const result =
            await db.query(`
                SELECT
                    COUNT(*)::int
                        AS total_orders,

                    COUNT(*) FILTER (
                        WHERE status =
                            'pending'
                    )::int
                        AS pending_orders,

                    COUNT(*) FILTER (
                        WHERE status =
                            'confirmed'
                    )::int
                        AS confirmed_orders,

                    COUNT(*) FILTER (
                        WHERE status =
                            'processing'
                    )::int
                        AS processing_orders,

                    COUNT(*) FILTER (
                        WHERE status =
                            'shipped'
                    )::int
                        AS shipped_orders,

                    COUNT(*) FILTER (
                        WHERE status =
                            'delivered'
                    )::int
                        AS delivered_orders,

                    COUNT(*) FILTER (
                        WHERE status =
                            'cancelled'
                    )::int
                        AS cancelled_orders,

                    COALESCE(
                        SUM(total)
                        FILTER (
                            WHERE status !=
                                'cancelled'
                        ),
                        0
                    ) AS total_revenue

                FROM orders;
            `);

        return res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        console.error(
            "Error fetching order stats:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch order statistics.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Order Details
|--------------------------------------------------------------------------
*/

export const getOrderDetails = async (
    req,
    res
) => {
    const orderId =
        Number(req.params.id);

    if (
        !Number.isInteger(orderId) ||
        orderId <= 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid order ID.",
        });
    }

    try {
        /*
        |--------------------------------------------------------------------------
        | Complete order + customer + delivery data
        |--------------------------------------------------------------------------
        */

        const orderResult =
            await db.query(
                `
                    SELECT
                        o.id,
                        o.customer_id,
                        o.status,
                        o.total,
                        o.delivery_price,
                        o.delivery_type,
                        o.created_at,

                        o.shipping_provider_id,
                        o.shipping_zone_id,
                        o.delivery_office_id,

                        c.full_name
                            AS customer_name,
                        c.phone_number
                            AS customer_phone,
                        c.province
                            AS customer_province,
                        c.municipality
                            AS customer_municipality,
                        c.province_id
                            AS customer_province_id,
                        c.municipality_id
                            AS customer_municipality_id,

                        p.id
                            AS province_id,
                        p.name
                            AS province_name,

                        m.id
                            AS municipality_id,
                        m.commune_name
                            AS municipality_name,

                        sp.name
                            AS shipping_provider_name,
                        sp.logo_url
                            AS shipping_provider_logo,

                        sz.home_price,
                        sz.office_price,
                        sz.is_active
                            AS shipping_zone_active,

                        dof.name
                            AS delivery_office_name,
                        dof.address
                            AS delivery_office_address,
                        dof.municipality_id
                            AS delivery_office_municipality_id

                    FROM orders o

                    LEFT JOIN customers c
                        ON c.id =
                            o.customer_id

                    LEFT JOIN province p
                        ON p.id =
                            c.province_id

                    LEFT JOIN municipality m
                        ON m.id =
                            c.municipality_id

                    LEFT JOIN shipping_providers sp
                        ON sp.id =
                            o.shipping_provider_id

                    LEFT JOIN shipping_zones sz
                        ON sz.id =
                            o.shipping_zone_id

                    LEFT JOIN delivery_offices dof
                        ON dof.id =
                            o.delivery_office_id

                    WHERE o.id = $1

                    LIMIT 1;
                `,
                [orderId]
            );

        if (
            !orderResult.rows.length
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Order not found.",
            });
        }

        const order =
            orderResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Order items
        |--------------------------------------------------------------------------
        */

        const itemsResult =
            await db.query(
                `
                    SELECT
                        oi.id,
                        oi.order_id,
                        oi.product_id,

                        p.name
                            AS product_name,

                        p.description
                            AS product_description,

                        (
                            SELECT
                                pi.image_url
                            FROM product_images pi
                            WHERE pi.product_id =
                                p.id
                            ORDER BY
                                pi.id ASC
                            LIMIT 1
                        ) AS image_url,

                        oi.quantity,
                        oi.unit_price,

                        (
                            oi.quantity *
                            oi.unit_price
                        ) AS line_total,

                        oi.selected_variants

                    FROM order_items oi

                    INNER JOIN products p
                        ON p.id =
                            oi.product_id

                    WHERE oi.order_id =
                        $1

                    ORDER BY
                        oi.id ASC;
                `,
                [orderId]
            );

        const items =
            itemsResult.rows.map(
                (item) => ({
                    ...item,
                    line_total:
                        Number(
                            item.quantity ||
                                0
                        ) *
                        Number(
                            item.unit_price ||
                                0
                        ),
                })
            );

        /*
        |--------------------------------------------------------------------------
        | Pricing
        |--------------------------------------------------------------------------
        */

        const subtotal =
            items.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.line_total ||
                            0
                    ),
                0
            );

        const deliveryPrice =
            Number(
                order.delivery_price ||
                    0
            );

        const total =
            Number(
                order.total || 0
            );

        /*
        |--------------------------------------------------------------------------
        | Complete response
        |--------------------------------------------------------------------------
        */

        return res.json({
            success: true,

            data: {
                /*
                | Keep the original order
                | object available for the
                | existing OrderDetailsSheet.
                */
                order,

                /*
                | Also expose the order fields
                | at the top level for the
                | print utility.
                */
                ...order,

                customer: {
                    id:
                        order.customer_id,

                    full_name:
                        order.customer_name,

                    phone_number:
                        order.customer_phone,

                    province:
                        order.customer_province,

                    municipality:
                        order.customer_municipality,

                    province_id:
                        order.customer_province_id,

                    municipality_id:
                        order.customer_municipality_id,
                },

                delivery: {
                    type:
                        order.delivery_type,

                    price:
                        deliveryPrice,

                    provider: {
                        id:
                            order.shipping_provider_id,

                        name:
                            order.shipping_provider_name,

                        logo_url:
                            order.shipping_provider_logo,
                    },

                    zone: {
                        id:
                            order.shipping_zone_id,

                        home_price:
                            Number(
                                order.home_price ||
                                    0
                            ),

                        office_price:
                            Number(
                                order.office_price ||
                                    0
                            ),

                        is_active:
                            order.shipping_zone_active,
                    },

                    office:
                        order.delivery_office_id
                            ? {
                                  id:
                                      order.delivery_office_id,

                                  name:
                                      order.delivery_office_name,

                                  address:
                                      order.delivery_office_address,

                                  municipality_id:
                                      order.delivery_office_municipality_id,
                              }
                            : null,
                },

                items,

                pricing: {
                    subtotal,

                    delivery:
                        deliveryPrice,

                    total,
                },
            },
        });
    } catch (error) {
        console.error(
            "Error fetching order details:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch order details.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

export const updateOrderStatus =
    async (req, res) => {
        const orderId =
            Number(req.params.id);

        const status =
            String(
                req.body?.status ?? ""
            )
                .trim()
                .toLowerCase();

        /*
        |--------------------------------------------------------------------------
        | Validate ID
        |--------------------------------------------------------------------------
        */

        if (
            !Number.isInteger(
                orderId
            ) ||
            orderId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order ID.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Validate status
        |--------------------------------------------------------------------------
        */

        if (
            !ALLOWED_STATUSES.includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order status. Allowed statuses: pending, confirmed, processing, shipped, delivered, cancelled.",
            });
        }

        const client =
            await db.connect();

        try {
            await client.query(
                "BEGIN"
            );

            /*
            |--------------------------------------------------------------------------
            | Lock order
            |--------------------------------------------------------------------------
            */

            const orderResult =
                await client.query(
                    `
                        SELECT
                            id,
                            status
                        FROM orders
                        WHERE id = $1
                        FOR UPDATE;
                    `,
                    [orderId]
                );

            if (
                !orderResult.rows.length
            ) {
                await client.query(
                    "ROLLBACK"
                );

                return res.status(
                    404
                ).json({
                    success: false,
                    message:
                        "Order not found.",
                });
            }

            const order =
                orderResult.rows[0];

            /*
            |--------------------------------------------------------------------------
            | Terminal orders cannot be changed
            |--------------------------------------------------------------------------
            */

            if (
                TERMINAL_STATUSES.includes(
                    order.status
                )
            ) {
                await client.query(
                    "ROLLBACK"
                );

                return res.status(
                    400
                ).json({
                    success: false,
                    message:
                        "This order can no longer be updated.",
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Same status
            |--------------------------------------------------------------------------
            */

            if (
                status ===
                order.status
            ) {
                await client.query(
                    "ROLLBACK"
                );

                return res.status(
                    400
                ).json({
                    success: false,
                    message:
                        "The order is already using this status.",
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Update
            |--------------------------------------------------------------------------
            */

            await client.query(
                `
                    UPDATE orders
                    SET status = $1
                    WHERE id = $2;
                `,
                [
                    status,
                    orderId,
                ]
            );

            await client.query(
                "COMMIT"
            );

            return res.json({
                success: true,

                message:
                    "Order status updated successfully.",

                data: {
                    order_id:
                        orderId,

                    previous_status:
                        order.status,

                    status,
                },
            });
        } catch (error) {
            try {
                await client.query(
                    "ROLLBACK"
                );
            } catch (
                rollbackError
            ) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }

            console.error(
                "Error updating order status:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update order status.",
            });
        } finally {
            client.release();
        }
    };

/*
|--------------------------------------------------------------------------
| Cancel Order
|--------------------------------------------------------------------------
*/

export const cancelOrder =
    async (req, res) => {
        const orderId =
            Number(req.params.id);

        if (
            !Number.isInteger(
                orderId
            ) ||
            orderId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid order ID.",
            });
        }

        const client =
            await db.connect();

        try {
            await client.query(
                "BEGIN"
            );

            const orderResult =
                await client.query(
                    `
                        SELECT
                            id,
                            status
                        FROM orders
                        WHERE id = $1
                        FOR UPDATE;
                    `,
                    [orderId]
                );

            if (
                !orderResult.rows.length
            ) {
                await client.query(
                    "ROLLBACK"
                );

                return res.status(
                    404
                ).json({
                    success: false,
                    message:
                        "Order not found.",
                });
            }

            const order =
                orderResult.rows[0];

            if (
                TERMINAL_STATUSES.includes(
                    order.status
                )
            ) {
                await client.query(
                    "ROLLBACK"
                );

                return res.status(
                    400
                ).json({
                    success: false,
                    message:
                        "This order is already finalized.",
                });
            }

            await client.query(
                `
                    UPDATE orders
                    SET status =
                        'cancelled'
                    WHERE id = $1;
                `,
                [orderId]
            );

            await client.query(
                "COMMIT"
            );

            return res.json({
                success: true,
                message:
                    "Order cancelled successfully.",
            });
        } catch (error) {
            try {
                await client.query(
                    "ROLLBACK"
                );
            } catch (
                rollbackError
            ) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }

            console.error(
                "Error cancelling order:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to cancel order.",
            });
        } finally {
            client.release();
        }
    };

/*
|--------------------------------------------------------------------------
| Export Orders
|--------------------------------------------------------------------------
*/

export const exportOrders =
    async (req, res) => {
        try {
            const result =
                await db.query(`
                    SELECT
                        o.id,
                        o.status,
                        o.total,
                        o.delivery_price,
                        o.delivery_type,
                        o.created_at,

                        c.full_name
                            AS customer_name,

                        c.phone_number
                            AS customer_phone,

                        c.province,

                        c.municipality,

                        sp.name
                            AS shipping_provider_name

                    FROM orders o

                    LEFT JOIN customers c
                        ON c.id =
                            o.customer_id

                    LEFT JOIN shipping_providers sp
                        ON sp.id =
                            o.shipping_provider_id

                    ORDER BY
                        o.created_at DESC;
                `);

            const headers = [
                "Order ID",
                "Status",
                "Total",
                "Delivery Price",
                "Delivery Type",
                "Created At",
                "Customer Name",
                "Customer Phone",
                "Province",
                "Municipality",
                "Shipping Provider",
            ];

            const escapeCsv = (
                value
            ) => {
                if (
                    value === null ||
                    value === undefined
                ) {
                    return "";
                }

                const stringValue =
                    String(value);

                if (
                    stringValue.includes(
                        ","
                    ) ||
                    stringValue.includes(
                        '"'
                    ) ||
                    stringValue.includes(
                        "\n"
                    )
                ) {
                    return `"${stringValue.replace(
                        /"/g,
                        '""'
                    )}"`;
                }

                return stringValue;
            };

            const rows =
                result.rows.map(
                    (row) => [
                        row.id,
                        row.status,
                        row.total,
                        row.delivery_price,
                        row.delivery_type,
                        row.created_at,
                        row.customer_name,
                        row.customer_phone,
                        row.province,
                        row.municipality,
                        row.shipping_provider_name,
                    ]
                );

            const csv = [
                headers
                    .map(
                        escapeCsv
                    )
                    .join(","),

                ...rows.map(
                    (row) =>
                        row
                            .map(
                                escapeCsv
                            )
                            .join(",")
                ),
            ].join("\n");

            res.setHeader(
                "Content-Type",
                "text/csv; charset=utf-8"
            );

            res.setHeader(
                "Content-Disposition",
                'attachment; filename="orders.csv"'
            );

            return res.send(
                csv
            );
        } catch (error) {
            console.error(
                "Error exporting orders:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to export orders.",
            });
        }
    };