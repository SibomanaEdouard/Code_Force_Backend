const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

exports.createCategory = async (req, res) => {
  try {
    const { name, subCategories } = req.body;
    
    // Check if category already exists for this user
    const existingCategory = await Category.findOne({ 
      userId: req.user.id,
      name: name 
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      userId: req.user.id,
      subCategories: subCategories || []
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, subCategories } = req.body;
    
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    if (subCategories) {
      category.subCategories = subCategories;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // First check if category is being used in any transactions
    const transactions = await Transaction.findOne({
      category: req.params.id
    });

    if (transactions) {
      return res.status(400).json({ 
        message: 'Cannot delete category that is being used in transactions' 
      });
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addSubCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if subcategory already exists
    const subCategoryExists = category.subCategories.some(
      sub => sub.name.toLowerCase() === name.toLowerCase()
    );

    if (subCategoryExists) {
      return res.status(400).json({ message: 'Subcategory already exists' });
    }

    category.subCategories.push({ name });
    await category.save();
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if subcategory is being used in transactions
    const transactions = await Transaction.findOne({
      subCategory: subCategoryId
    });

    if (transactions) {
      return res.status(400).json({ 
        message: 'Cannot delete subcategory that is being used in transactions' 
      });
    }

    category.subCategories = category.subCategories.filter(
      sub => sub._id.toString() !== subCategoryId
    );

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
