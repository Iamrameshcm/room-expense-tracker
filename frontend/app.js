
const API_BASE = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));


document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value.toLowerCase();
  console.log(email);
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


// window.addEventListener('DOMContentLoaded', async () => {
//   if (!token) return window.location.href = 'index.html';

//   if (currentUser.role === 'admin') document.getElementById('adminSection').classList.remove('hidden');

//   await loadUsers();
//   await loadExpenses();
// });

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const currentPage = window.location.pathname.split('/').pop();


    const page = currentPage.toLowerCase();


    if (!token && page !== 'index.html') {
      window.location.href = 'index.html';
      return;
    }

 
    if (token && page === 'index.html') {
      window.location.href = 'dashboard.html';
      return;
    }


    if (page === 'dashboard.html') {
      if (currentUser?.role === 'admin') {
        const adminEl = document.getElementById('adminSection');
        if (adminEl) adminEl.classList.remove('hidden');
      }

      try {
        await loadUsers();
      } catch(err) {
        console.error("Error loading users:", err);
      }

      try {
        await loadExpenses();
      } catch(err) {
        console.error("Error loading expenses:", err);
      }
    }
  } catch(err) {
    console.error("DOMContentLoaded error:", err);
  }
});



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

document.getElementById('addExpenseBtn')?.addEventListener('click', async () => {
  const userId = document.getElementById('expenseUser').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const remark = document.getElementById('expenseRemarks').value;
  const errorEl = document.getElementById('expenseError');


  if (errorEl) errorEl.textContent = '';

  if (isNaN(amount) || amount <= 0) {
    if (errorEl) errorEl.textContent = 'Amount must be a positive number';
    return;
  }
  if (amount >= 3000) {
    if (errorEl) errorEl.textContent = 'Amount must be less than 3000. Please contact the admin if you need to add an expense above this limit.';
    return;
  }

  try {
    await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ userId, amount, remark, date: new Date() })
    });

    console.log("userId", userId);


    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseRemarks').value = '';

    await loadExpenses();
    await getSummary();
  } catch(err) {
    if (errorEl) errorEl.textContent = 'Error adding expense';
    console.error(err);
  }
});


async function loadExpenses() {
  console.log("started")
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
console.log(currentUser.name);
document.getElementById('loadUsageBtn').addEventListener('click', () => {
    const userName = currentUser.name;
    const month = document.getElementById('usageMonth').value;
    loadUserUsage(userName, month);
    console.log("Current User expense Button Clicked ")
  });
async function loadUserUsage(userName, month) {
  try {
    const res = await fetch(`${API_BASE}/expenses/usage/${userName}/${month}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Could not fetch usage');

    const expenses = await res.json();
    const usageList = document.getElementById('usageList');
    usageList.innerHTML = '';

    expenses.forEach(exp => {
      const div = document.createElement('div');
      div.textContent = `${new Date(exp.date).toLocaleDateString()}: ₹${exp.amount} - ${exp.remark}`;
      usageList.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}
