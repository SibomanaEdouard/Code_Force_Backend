const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const categoryController = require("../controllers/CategoryController")

// Create category
router.post('/', [
  auth,
  [
    check('name', 'Category name is required').not().isEmpty(),
    validateRequest
  ]
], categoryController.createCategory);

// Get all categories
router.get('/', auth, categoryController.getCategories);

// Update category
router.put('/:id', [
  auth,
  [
    check('name', 'Category name is required').not().isEmpty(),
    validateRequest
  ]
], categoryController.updateCategory);

// Delete category
router.delete('/:id', auth, categoryController.deleteCategory);

// Add subcategory to category
router.post('/:id/subcategories', [
  auth,
  [
    check('name', 'Subcategory name is required').not().isEmpty(),
    validateRequest
  ]
], categoryController.addSubCategory);

// Remove subcategory from category
router.delete('/:id/subcategories/:subCategoryId', auth, categoryController.removeSubCategory);

module.exports = router;