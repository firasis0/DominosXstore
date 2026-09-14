import express from 'express';

import {getCategories,
        toggleCategory,
        addCategory,
        updateCategory,
        deleteCategory

} from '../Controllers/categories.controller.js' 

const router = express.Router();

//Dahboard Categories :

//GET CATEGORIES ROUTE : 
router.get('/dashboard/categories',getCategories);

//PATCH toggle activate/deactivate
router.patch('/dashboard/categories/:id/toggle',toggleCategory);

//PATCH Crate a new category
router.patch('/dashboard/categories/:id',updateCategory);

//POST Crate a new category
router.post('/dashboard/categories',addCategory);

//DELETE Delete empty category
router.delete("/dashboard/categories/:id",deleteCategory);

export default router;