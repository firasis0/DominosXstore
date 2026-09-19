import express from 'express';

import {
    getDashboardOrders,
    getOrderStats,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder,
    exportOrders,
    createOrder
} from '../Controllers/orders.controller.js';

const router = express.Router();

// Keep /export and /stats above /:id so they are not swallowed by the param route
router.get('/dashboard/orders/export', exportOrders);
router.get('/dashboard/orders/stats', getOrderStats);

router.get('/dashboard/orders', getDashboardOrders);
router.get('/dashboard/orders/:id', getOrderDetails);

router.patch('/dashboard/orders/:id/status', updateOrderStatus);
router.patch('/dashboard/orders/:id/cancel', cancelOrder);

router.post('/orders', createOrder);
export default router;
