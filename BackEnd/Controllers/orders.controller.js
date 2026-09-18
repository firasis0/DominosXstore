import db from '../DB/db.js';

// Forward-only workflow. Cancelled is a separate terminal branch handled by cancelOrder.
const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const TERMINAL_STATUSES = ['delivered', 'cancelled'];

// Builds the shared WHERE clause + params for both the list and the export endpoints.
const buildOrderFilters = (query) => {
    const conditions = [];
    const values = [];

    if (query.search) {
        values.push(`%${query.search.replace(/^#/, '')}%`);
        const index = values.length;
        conditions.push(
            `(CAST(o.id AS TEXT) ILIKE $${index} OR c.full_name ILIKE $${index} OR c.phone_number ILIKE $${index})`
        );
    }

    if (query.status) {
        values.push(query.status);
        conditions.push(`o.status = $${values.length}`);
    }

    if (query.payment_status) {
        values.push(query.payment_status);
        conditions.push(`o.payment_status = $${values.length}`);
    }

    if (query.delivery_type) {
        values.push(query.delivery_type);
        conditions.push(`o.delivery_type = $${values.length}`);
    }

    if (query.date_from) {
        values.push(query.date_from);
        conditions.push(`o.created_at >= $${values.length}::date`);
    }

    if (query.date_to) {
        values.push(query.date_to);
        conditions.push(`o.created_at < ($${values.length}::date + interval '1 day')`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return { where, values };
};

// Dashboard: paginated / filtered order list
export const getDashboardOrders = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const { where, values } = buildOrderFilters(req.query);

        const listQuery = `
            SELECT
                o.id,
                o.status,
                o.payment_status,
                o.total,
                o.delivery_price,
                o.delivery_type,
                o.created_at,
                c.id AS customer_id,
                c.full_name AS customer_name,
                c.phone_number AS customer_phone,
                c.province AS customer_province,
                c.municipality AS customer_municipality,
                sp.name AS shipping_provider_name,
                COALESCE(SUM(oi.quantity), 0)::int AS item_count
            FROM orders o
            INNER JOIN customers c ON c.id = o.customer_id
            LEFT JOIN shipping_providers sp ON sp.id = o.shipping_provider_id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            ${where}
            GROUP BY o.id, c.id, sp.name
            ORDER BY o.created_at DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2};
        `;

        const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM orders o
            INNER JOIN customers c ON c.id = o.customer_id
            ${where};
        `;

        const [{ rows }, { rows: countRows }] = await Promise.all([
            db.query(listQuery, [...values, limit, offset]),
            db.query(countQuery, values),
        ]);

        const total = countRows[0]?.total || 0;

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total,
                pageCount: Math.max(1, Math.ceil(total / limit)),
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard orders:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while fetching orders',
        });
    }
};

// Dashboard: order stats cards (not affected by the toolbar filters — store-wide totals)
export const getOrderStats = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT
                COUNT(*)::int AS total_orders,
                COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
                COUNT(*) FILTER (WHERE status IN ('confirmed', 'processing'))::int AS to_ship,
                COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0)::int AS revenue
            FROM orders;
        `);

        res.status(200).json({
            success: true,
            data: rows[0],
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while fetching order stats',
        });
    }
};

// Dashboard: single order — customer, items, delivery, payment, status timeline
export const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const orderQuery = `
            SELECT
                o.id,
                o.status,
                o.payment_status,
                o.total,
                o.delivery_price,
                o.delivery_type,
                o.created_at,
                c.id AS customer_id,
                c.full_name AS customer_name,
                c.phone_number AS customer_phone,
                c.province AS customer_province,
                c.municipality AS customer_municipality,
                sp.id AS shipping_provider_id,
                sp.name AS shipping_provider_name,
                sp.logo_url AS shipping_provider_logo,
                dof.id AS delivery_office_id,
                dof.name AS delivery_office_name,
                dof.address AS delivery_office_address
            FROM orders o
            INNER JOIN customers c ON c.id = o.customer_id
            LEFT JOIN shipping_providers sp ON sp.id = o.shipping_provider_id
            LEFT JOIN delivery_offices dof ON dof.id = o.delivery_office_id
            WHERE o.id = $1;
        `;

        const itemsQuery = `
            SELECT
                oi.id,
                oi.product_id,
                p.name AS product_name,
                (
                    SELECT pi.image_url
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.id ASC
                    LIMIT 1
                ) AS product_image,
                oi.quantity,
                oi.unit_price,
                (oi.quantity * oi.unit_price)::int AS line_total
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = $1
            ORDER BY oi.id ASC;
        `;

        const historyQuery = `
            SELECT id, status, changed_at
            FROM order_status_history
            WHERE order_id = $1
            ORDER BY changed_at ASC;
        `;

        const [{ rows: orderRows }, { rows: itemRows }, { rows: historyRows }] = await Promise.all([
            db.query(orderQuery, [id]),
            db.query(itemsQuery, [id]),
            db.query(historyQuery, [id]),
        ]);

        if (orderRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        const subtotal = itemRows.reduce((sum, item) => sum + item.line_total, 0);

        res.status(200).json({
            success: true,
            data: {
                ...orderRows[0],
                subtotal,
                items: itemRows,
                // Real history only — if no rows were ever recorded, this is empty rather than invented.
                status_history: historyRows,
            },
        });
    } catch (error) {
        console.error('Error fetching order details:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while fetching order details',
        });
    }
};

// Dashboard: advance the order to the next step of the workflow
export const updateOrderStatus = async (req, res) => {
    const client = await db.connect();

    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!STATUS_FLOW.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${STATUS_FLOW.join(', ')}`,
            });
        }

        await client.query('BEGIN');

        const { rows: currentRows } = await client.query(
            `SELECT status FROM orders WHERE id = $1 FOR UPDATE;`,
            [id]
        );

        if (currentRows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        const currentStatus = currentRows[0].status;
        const currentIndex = STATUS_FLOW.indexOf(currentStatus);
        const nextIndex = STATUS_FLOW.indexOf(status);

        if (TERMINAL_STATUSES.includes(currentStatus)) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: `Order is already ${currentStatus} and cannot be updated further`,
            });
        }

        if (nextIndex !== currentIndex + 1) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: `Order must move to "${STATUS_FLOW[currentIndex + 1]}" next, not "${status}"`,
            });
        }

        const { rows } = await client.query(
            `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *;`,
            [status, id]
        );

        await client.query(
            `INSERT INTO order_status_history (order_id, status) VALUES ($1, $2);`,
            [id, status]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Order status updated',
            data: rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error updating order status:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while updating order status',
        });
    } finally {
        client.release();
    }
};

// Dashboard: cancel — separate terminal branch, requires confirmation on the frontend
export const cancelOrder = async (req, res) => {
    const client = await db.connect();

    try {
        const { id } = req.params;

        await client.query('BEGIN');

        const { rows: currentRows } = await client.query(
            `SELECT status FROM orders WHERE id = $1 FOR UPDATE;`,
            [id]
        );

        if (currentRows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (TERMINAL_STATUSES.includes(currentRows[0].status)) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: `Order is already ${currentRows[0].status} and cannot be cancelled`,
            });
        }

        const { rows } = await client.query(
            `UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *;`,
            [id]
        );

        await client.query(
            `INSERT INTO order_status_history (order_id, status) VALUES ($1, 'cancelled');`,
            [id]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Order cancelled',
            data: rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error cancelling order:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while cancelling order',
        });
    } finally {
        client.release();
    }
};

// Dashboard: export the full filtered dataset (not just the current page) as CSV
export const exportOrders = async (req, res) => {
    try {
        const { where, values } = buildOrderFilters(req.query);

        const { rows } = await db.query(
            `
            SELECT
                o.id,
                o.status,
                o.payment_status,
                o.total,
                o.delivery_price,
                o.delivery_type,
                o.created_at,
                c.full_name AS customer_name,
                c.phone_number AS customer_phone,
                COALESCE(SUM(oi.quantity), 0)::int AS item_count
            FROM orders o
            INNER JOIN customers c ON c.id = o.customer_id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            ${where}
            GROUP BY o.id, c.id
            ORDER BY o.created_at DESC;
            `,
            values
        );

        const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

        const header = [
            'Order ID', 'Customer', 'Phone', 'Items', 'Total', 'Delivery Price',
            'Delivery Type', 'Payment Status', 'Status', 'Created At',
        ];

        const csvRows = rows.map((order) => [
            order.id, order.customer_name, order.customer_phone, order.item_count,
            order.total, order.delivery_price, order.delivery_type, order.payment_status,
            order.status, new Date(order.created_at).toISOString(),
        ].map(escape).join(','));

        const csv = [header.map(escape).join(','), ...csvRows].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
        res.status(200).send(csv);
    } catch (error) {
        console.error('Error exporting orders:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while exporting orders',
        });
    }
};
