const express = require('express');
const Expense = require('../models/Expense');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:month', auth, async (req, res) => {
  const monthParam = req.params.month;
  const now = new Date();
  const month = monthParam || `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(year, mon - 1, 1);
  const end = new Date(year, mon, 0, 23, 59, 59, 999);

  const expenses = await Expense.find({ date: { $gte: start, $lte: end } }).populate('userId', 'name');
  const users = await User.find().select('name');

  const memberCount = users.length || 1;
  let total = 0;
  const contributions = {};
  expenses.forEach(exp => {
    const id = exp.userId?._id.toString() || 'unknown';
    total += exp.amount;
    contributions[id] = (contributions[id] || 0) + exp.amount;
  });

  const totalRounded = Math.round(total * 100) / 100;
  const perPerson = Math.round((totalRounded / memberCount) * 100) / 100;

  const userSummaries = users.map(u => {
    const id = u._id.toString();
    const paid = Math.round((contributions[id] || 0) * 100) / 100;
    const balance = Math.round((paid - perPerson) * 100) / 100;
    return { id, name: u.name, paid, share: perPerson, balance };
  });

  res.json({ month, total: totalRounded, members: memberCount, perPerson, userSummaries, expenses });
});

module.exports = router;
