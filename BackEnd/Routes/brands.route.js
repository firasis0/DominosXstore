import express from 'express';

import {getBrands

} from '../Controllers/brands.controller.js' 

const router = express.Router();

//Dahboard Categories :

//GET CATEGORIES ROUTE : 
router.get('/dashboard/brands',getBrands);

export default router;