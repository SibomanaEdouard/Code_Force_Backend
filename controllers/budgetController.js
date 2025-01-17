const Budget = require('../models/Budget');

exports.setBudget = async (req, res) => {
  try {
    const { amount, period, category } = req.body;
    
    let budget = await Budget.findOne({
      userId: req.user.id,
      category
    });

    if (budget) {
      budget.amount = amount;
      budget.period = period;
    } else {
      budget = new Budget({
        userId: req.user.id,
        amount,
        period,
        category
      });
    }

    await budget.save();
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBudgetAlerts = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id })
      .populate('category');

    const alerts = budgets
      .filter(budget => budget.spent > budget.amount)
      .map(budget => ({
        category: budget.category.name,
        amount: budget.spent - budget.amount
      }));

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};