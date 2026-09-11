import express from 'express';
import { getDashboardProducts } from '../Controllers/product.controller.js';

const router = express.Router();

//Router : GET / api/dashboard/products 
router.get('/dashboard/products',getDashboardProducts);

export default router; 