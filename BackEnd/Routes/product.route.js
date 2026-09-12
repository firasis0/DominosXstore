import express from 'express';
import { getDashboardProducts,
         toggleProductActive,
         deleteProduct,
         createProduct,
         updateProduct
 } from '../Controllers/product.controller.js';

const router = express.Router();

//Router : GET / api/dashboard/products 
router.get('/dashboard/products',getDashboardProducts);

// PATCH for the Product Toggle 
router.patch('/dashboard/products/:id/active',toggleProductActive);

//DELETE product 
router.delete('/dashboard/products/:id',deleteProduct);

//POST product 
router.post('/dashboard/products', createProduct)

//PUT product
router.put('/dashboard/products/:id', updateProduct)


export default router; 