import express from 'express';
import { getDashboardProducts,
         toggleProductActive,
         deleteProduct,
         createProduct,
         updateProduct,
         getStoreProducts
 } from '../Controllers/product.controller.js';

const router = express.Router();

//DASHBOARD ROUTES : 

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

//STORE ROUTES : 

//GET STORE PRODUCTS : 
router.get('/shop',getStoreProducts);

export default router; 