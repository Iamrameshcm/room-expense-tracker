const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();
const User = require("../models/User")

router.post('/', async (req, res) => {
  const { amount, remark } = req.body;
  console.log(req.body);
  const expense = new Expense({ userId: req.user.id, amount, remark });
  await expense.save();
  res.json({ message: 'Expense added', expense });
});

router.get('/', async (req, res) => {
  const expenses = await Expense.find().populate('userId', 'name');
  res.json(expenses);
});

// GET /api/expenses/usage/:name/:month
router.get('/usage/:name/:month', async (req, res) => {
  console.log("user expanse hit");
  try {
    const { name, month } = req.params;

    // Find user by name
    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build date range for the month (YYYY-MM)
    const startDate = new Date(month + "-01");
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    // Find expenses for that user in the given month
    const expenses = await Expense.find({
      userId: user._id,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: 1 });

    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
