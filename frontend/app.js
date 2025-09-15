const API_BASE = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));

// --- LOGIN ---
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));

    window.location.href = 'dashboard.html';
  } catch(err) {
    errorEl.textContent = err.message;
  }
});

// --- DASHBOARD ---
window.addEventListener('DOMContentLoaded', async () => {
  if (!token) return window.location.href = 'index.html';

  // Show admin section
  if (currentUser.role === 'admin') document.getElementById('adminSection').classList.remove('hidden');

  await loadUsers();
  await loadExpenses();
});

// Load users for admin dropdown
async function loadUsers() {
  const res = await fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } });
  const users = await res.json();

  const userSelect = document.getElementById('expenseUser');
  userSelect.innerHTML = '';
  users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u._id;
    opt.textContent = u.name;
    userSelect.appendChild(opt);
  });

  const userList = document.getElementById('userList');
  if (userList) {
    userList.innerHTML = '';
    users.forEach(u => {
      const div = document.createElement('div');
      div.className = 'user-item';
      div.textContent = `${u.name} (${u.email})`;
      userList.appendChild(div);
    });
  }
}

// Add new user (admin only)
document.getElementById('addUserBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('newUserName').value;
  const email = document.getElementById('newUserEmail').value;
  const password = document.getElementById('newUserPassword').value;

  await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, email, password })
  });

  document.getElementById('newUserName').value = '';
  document.getElementById('newUserEmail').value = '';
  document.getElementById('newUserPassword').value = '';
  await loadUsers();
});

// Add expense
document.getElementById('addExpenseBtn')?.addEventListener('click', async () => {
  const userId = document.getElementById('expenseUser').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const remark = document.getElementById('expenseRemarks').value;
  console.log(remark)

  await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, amount, remark, date: new Date() })    
  });

  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseRemarks').value = '';
  await loadExpenses();
  await getSummary();
});

// Load all expenses
async function loadExpenses() {
  const res = await fetch(`${API_BASE}/expenses`, { headers: { Authorization: `Bearer ${token}` } });
  const expenses = await res.json();
  const expenseList = document.getElementById('expenseList');
  expenseList.innerHTML = '';

  expenses.forEach(exp => {
    const div = document.createElement('div');
    div.className = 'expense-item';
    div.textContent = `${exp.userId.name}: ₹${exp.amount} (${exp.remark}) on ${new Date(exp.date).toLocaleDateString()}`;
    expenseList.appendChild(div);
  });
}

// Monthly summary
document.getElementById('getSummaryBtn')?.addEventListener('click', getSummary);

async function getSummary() {
  const month = document.getElementById('summaryMonth').value;
  if (!month) return;

  const res = await fetch(`${API_BASE}/summary/${month}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();

  const summaryList = document.getElementById('summaryList');
  summaryList.innerHTML = '';
  data.userSummaries.forEach(u => {
    const div = document.createElement('div');
    div.className = 'summary-item';
    div.textContent = `${u.name}: Paid ₹${u.paid}, Share ₹${u.share}, Balance ₹${u.balance}`;
    summaryList.appendChild(div);
  });
}
