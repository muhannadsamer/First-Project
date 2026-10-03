const apiUrl = 'http://localhost:3000/api/expenses';
const expensesList = document.getElementById('expenses-list');
const spinner = document.getElementById('loading-spinner');
const alertContainer = document.getElementById('alert-container');
const addExpenseForm = document.getElementById('add-expense-form');
const editExpenseForm = document.getElementById('edit-expense-form');
const filterCategory = document.getElementById('filter-category');
const searchTitle = document.getElementById('search-title');
const darkModeToggle = document.getElementById('dark-mode-toggle');

let allExpenses = [];
let editModal;

// Set up the Bootstrap modal and load the real database data when the page opens.
document.addEventListener('DOMContentLoaded', () => {
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    fetchExpenses();
});

function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`
        setTimeout(() =>{ alertContainer.innerHTML = ''; }, 5000);
}

// Read the server's JSON error message when possible.
async function getErrorMessage(response, fallback) {
    try {
        const data = await response.json();
        return data.error || data.message || fallback;
    } catch {
        return fallback;
    }
}

function updateSummary(expenses) {
    let total = 0;
    let highest = 0;
    expenses.forEach(expense => {
        const amount = Number(expense.amount);
        total += amount;
        if (amount > highest) highest = amount;
    });
    document.getElementById('total-amount').textContent = total.toFixed(2);
    document.getElementById('expenses-count').textContent = expenses.length;
    document.getElementById('highest-expense').textContent = highest.toFixed(2);
}

async function fetchExpenses() {
    spinner.style.display = 'block';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(await getErrorMessage(response, 'Could not load expenses.'));
        allExpenses = await response.json();
        updateSummary(allExpenses); // Summary always uses ALL expenses, not the filtered list.
        applyFilters();
    } catch (error) {
        showAlert(`Could not connect to the server. Make sure the backend and PostgreSQL are running. Details: ${error.message}`);
    } finally {
        spinner.style.display = 'none';
    }
}

function renderTable(expenses) {
    expensesList.innerHTML = '';
    if (expenses.length === 0) {
        expensesList.innerHTML = '<tr><td colspan="5" class="text-center">No expenses found.</td></tr>';
        return;
    }
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        let badgeClass = 'bg-secondary';
        if (expense.category === 'Food') badgeClass = 'bg-success';
        else if (expense.category === 'Transport') badgeClass = 'bg-primary';
        else if (expense.category === 'Bills') badgeClass = 'bg-warning text-dark';
        else if (expense.category === 'Entertainment') badgeClass = 'bg-info text-dark';
        // Escape user-controlled text before placing it into HTML.
        const safeTitle = String(expense.title).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
        row.innerHTML = `
            <td>${safeTitle}</td>
            <td>${Number(expense.amount).toFixed(2)}</td>
            <td><span class="badge ${badgeClass}">${expense.category}</span></td>
            <td>${expense.date}</td>
            <td>
                <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${Number(expense.id)})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${Number(expense.id)})">Delete</button>
            </td>`;
        expensesList.appendChild(row);
    });
}

// Apply both controls together, so search and category filter do not cancel each other out.
function applyFilters() {
    const selectedCategory = filterCategory.value;
    const searchTerm = searchTitle.value.trim().toLowerCase();
    const filtered = allExpenses.filter(expense => {
        const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
        const matchesTitle = expense.title.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesTitle;
    });
    renderTable(filtered);
}

function validateExpense(title, amount, category, date) {
    if (!title.trim() || amount === '' || !category || !date) {
        showAlert('Please fill in all fields.', 'warning');
        return false;
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        showAlert('Amount must be a number greater than 0.', 'warning');
        return false;
    }
    return true;
}

addExpenseForm.addEventListener('submit', async event => {
    event.preventDefault();
    const title = document.getElementById('title').value.trim();
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    if (!validateExpense(title, amount, category, date)) return;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title, amount: Number(amount), category, date})
        });
        if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to add expense.'));
        addExpenseForm.reset();
        showAlert('Expense added successfully.', 'success');
        await fetchExpenses();
    } catch (error) {
        showAlert(`Could not add expense: ${error.message}`);
    }
});

window.deleteExpense = async function(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
        const response = await fetch(`${apiUrl}/${id}`, {method: 'DELETE'});
        if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to delete expense.'));
        showAlert('Expense deleted successfully.', 'success');
        await fetchExpenses();
    } catch (error) {
        showAlert(`Could not delete expense: ${error.message}`);
    }
};

window.openEditModal = function(id) {
    const expense = allExpenses.find(item => Number(item.id) === Number(id));
    if (!expense) return;
    document.getElementById('edit-id').value = expense.id;
    document.getElementById('edit-title').value = expense.title;
    document.getElementById('edit-amount').value = expense.amount;
    document.getElementById('edit-category').value = expense.category;
    document.getElementById('edit-date').value = expense.date;
    editModal.show();
};

editExpenseForm.addEventListener('submit', async event => {
    event.preventDefault();
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value.trim();
    const amount = document.getElementById('edit-amount').value;
    const category = document.getElementById('edit-category').value;
    const date = document.getElementById('edit-date').value;
    if (!validateExpense(title, amount, category, date)) return;

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title, amount: Number(amount), category, date})
        });
        if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to update expense.'));
        editModal.hide();
        showAlert('Expense updated successfully.', 'success');
        await fetchExpenses();
    } catch (error) {
        showAlert(`Could not update expense: ${error.message}`);
    }
});

filterCategory.addEventListener('change', applyFilters);
searchTitle.addEventListener('input', applyFilters);

// Bonus: toggle Bootstrap's built-in light/dark theme.
let isDarkMode = false;
darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
    darkModeToggle.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
});
