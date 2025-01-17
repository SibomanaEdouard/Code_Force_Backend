const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, subCategory, account, description } = req.body;
    
    const transaction = new Transaction({
      userId: req.user.id,
      amount,
      type,
      category,
      subCategory,
      account,
      description
    });

    await transaction.save();

    // Update budget if it's an expense
    if (type === 'expense') {
      await Budget.findOneAndUpdate(
        { userId: req.user.id, category },
        { $inc: { spent: amount } }
      );
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate('category')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTransactionsSummary = async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          }
        }
      }
    ]);

    res.json({
      totalIncome: summary[0]?.totalIncome || 0,
      totalExpenses: summary[0]?.totalExpenses || 0,
      balance: (summary[0]?.totalIncome || 0) - (summary[0]?.totalExpenses || 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};