import express from 'express';

import {getCategories

} from '../Controllers/categories.controller.js' 

const router = express.Router();

//Dahboard Categories :

//GET CATEGORIES ROUTE : 
router.get('/dashboard/categories',getCategories);

export default router;