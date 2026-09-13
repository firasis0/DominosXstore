import express from 'express';

import {getCategories,
        toggleCategory

} from '../Controllers/categories.controller.js' 

const router = express.Router();

//Dahboard Categories :

//GET CATEGORIES ROUTE : 
router.get('/dashboard/categories',getCategories);

//PATCH toggle activate/deactivate
router.patch('/dashboard/categories/:id/toggle',toggleCategory);

export default router;