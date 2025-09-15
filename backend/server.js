require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const auth = require('./middleware/auth'); 

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); 

app.use('/api/users', auth, userRoutes);
app.use('/api/expenses', auth, expenseRoutes);
app.use('/api/summary', auth, summaryRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
