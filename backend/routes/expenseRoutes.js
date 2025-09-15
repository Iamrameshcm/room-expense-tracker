const express = require('express');
const Expense = require('../models/Expense');
const router = express.Router();

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

module.exports = router;
