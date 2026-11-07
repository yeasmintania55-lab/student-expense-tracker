
// ==========================================
// STUDENT EXPENSE & BUDGET TRACKER
// ==========================================

// Load saved monthly budget
let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 10000;

// Load expenses
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Chart variable
let expenseChart = null;

// Get HTML elements
const expenseForm = document.getElementById("expense-form");
const expenseName = document.getElementById("expense-name");
const expenseAmount = document.getElementById("expense-amount");
const expenseDate = document.getElementById("expense-date");
const expenseCategory = document.getElementById("expense-category");

const expenseList = document.getElementById("expense-list");
const totalExpenses = document.getElementById("total-expenses");
const remainingBalance = document.getElementById("remaining-balance");
const monthlyBudgetElement = document.getElementById("monthly-budget");

const searchExpense = document.getElementById("search-expense");
const monthFilter = document.getElementById("month-filter");
const categorySummary = document.getElementById("category-summary");
const exportButton = document.getElementById("export-btn");

const categories = [
    "Food",
    "Travel",
    "Education",
    "Shopping",
    "Personal"
];

// ==========================================
// DATE FUNCTIONS
// ==========================================

function getLocalDateString() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getExpenseDate(expense) {
    return expense.date || getLocalDateString();
}

function getSelectedMonth() {
    return monthFilter.value || getLocalDateString().slice(0, 7);
}

function getMonthlyExpenses() {
    return expenses.filter(function(expense) {
        return getExpenseDate(expense).slice(0, 7) === getSelectedMonth();
    });
}

// ==========================================
// LOCAL STORAGE
// ==========================================

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function saveBudget() {
    localStorage.setItem("monthlyBudget", monthlyBudget);
}

// ==========================================
// MONTHLY BUDGET SETTING
// ==========================================

// Create budget setting section automatically
const budgetSection = document.createElement("section");

budgetSection.className = "budget-setting";

budgetSection.innerHTML = `
    <h2>Set Monthly Budget</h2>
    <form id="budget-form">
        <input
            type="number"
            id="budget-input"
            placeholder="Enter monthly budget"
            min="0.01"
            step="0.01"
            required
        >
        <button type="submit">Update Budget</button>
    </form>
    <p id="budget-message"></p>
`;

// Add it below dashboard cards
const cardsSection = document.querySelector(".cards");
const mainContent = document.querySelector(".main-content");

mainContent.insertBefore(budgetSection, mainContent.children[2]);

const budgetForm = document.getElementById("budget-form");
const budgetInput = document.getElementById("budget-input");
const budgetMessage = document.getElementById("budget-message");

// Show current budget
budgetInput.value = monthlyBudget;

// Update budget
budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newBudget = Number(budgetInput.value);

    if (!Number.isFinite(newBudget) || newBudget <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    monthlyBudget = newBudget;

    saveBudget();
    updateDashboard();

    budgetMessage.textContent =
        "Monthly budget updated successfully!";

    budgetInput.value = monthlyBudget;
});

// ==========================================
// ADD EXPENSE
// ==========================================

expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const date = expenseDate.value;
    const category = expenseCategory.value;

    if (!name || !Number.isFinite(amount) || amount <= 0 || !date || !category) {
        alert("Please enter valid expense details.");
        return;
    }

    const selectedMonthTotal = expenses
        .filter(function(expense) {
            return getExpenseDate(expense).slice(0, 7) === date.slice(0, 7);
        })
        .reduce(function(total, expense) {
            return total + Number(expense.amount);
        }, 0);

    if (selectedMonthTotal + amount > monthlyBudget) {
        alert("This expense exceeds your monthly budget!");
        return;
    }

    const newExpense = {
        id: Date.now(),
        name: name,
        amount: amount,
        date: date,
        category: category
    };

    expenses.push(newExpense);

    saveExpenses();

    monthFilter.value = date.slice(0, 7);

    expenseForm.reset();
    expenseDate.value = getLocalDateString();

    updateDashboard();

    alert("Expense added successfully!");
});

// ==========================================
// DISPLAY EXPENSES
// ==========================================

function displayExpenses(list) {
    expenseList.innerHTML = "";

    if (list.length === 0) {
        expenseList.innerHTML = "<p>No expenses found.</p>";
        return;
    }

    list.forEach(function(expense) {
        const expenseItem = document.createElement("div");

        const expenseDetails = document.createElement("span");

        expenseDetails.textContent =
            `${expense.name} - ₹${Number(expense.amount).toFixed(2)} - ${expense.category} - ${getExpenseDate(expense)}`;

        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", function() {
            editExpense(expense.id);
        });

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            if (confirm("Are you sure you want to delete this expense?")) {
                expenses = expenses.filter(function(item) {
                    return item.id !== expense.id;
                });

                saveExpenses();
                updateDashboard();
            }
        });

        expenseItem.appendChild(expenseDetails);
        expenseItem.appendChild(editButton);
        expenseItem.appendChild(deleteButton);

        expenseList.appendChild(expenseItem);
    });
}

// ==========================================
// EDIT EXPENSE
// ==========================================

function editExpense(id) {
    const expense = expenses.find(function(item) {
        return item.id === id;
    });

    if (!expense) {
        alert("Expense not found!");
        return;
    }

    const newName = prompt("Enter expense name:", expense.name);
    if (newName === null) return;

    const newAmount = prompt("Enter expense amount:", expense.amount);
    if (newAmount === null) return;

    const newDate = prompt(
        "Enter expense date (YYYY-MM-DD):",
        getExpenseDate(expense)
    );
    if (newDate === null) return;

    const newCategory = prompt(
        "Enter category (Food, Travel, Education, Shopping, Personal):",
        expense.category
    );
    if (newCategory === null) return;

    const amount = Number(newAmount);

    if (!newName.trim() || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid name and amount.");
        return;
    }

    const dateParts = newDate.split("-");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        alert("Enter date in YYYY-MM-DD format.");
        return;
    }

    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const day = Number(dateParts[2]);

    const checkDate = new Date(year, month - 1, day);

    if (
        checkDate.getFullYear() !== year ||
        checkDate.getMonth() !== month - 1 ||
        checkDate.getDate() !== day
    ) {
        alert("Please enter a valid date.");
        return;
    }

    if (!categories.includes(newCategory)) {
        alert("Please enter a valid category.");
        return;
    }

    const otherMonthlyExpenses = expenses
        .filter(function(item) {
            return item.id !== id &&
                getExpenseDate(item).slice(0, 7) === newDate.slice(0, 7);
        })
        .reduce(function(total, item) {
            return total + Number(item.amount);
        }, 0);

    if (otherMonthlyExpenses + amount > monthlyBudget) {
        alert("This expense exceeds your monthly budget!");
        return;
    }

    expense.name = newName.trim();
    expense.amount = amount;
    expense.date = newDate;
    expense.category = newCategory;

    saveExpenses();

    monthFilter.value = newDate.slice(0, 7);

    updateDashboard();

    alert("Expense updated successfully!");
}

// ==========================================
// CATEGORY SUMMARY
// ==========================================

function displayCategorySummary(monthlyExpenses) {
    categorySummary.innerHTML = "";

    if (monthlyExpenses.length === 0) {
        categorySummary.innerHTML = "<p>No expenses added yet.</p>";
        return;
    }

    const categoryTotals = {};

    monthlyExpenses.forEach(function(expense) {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += Number(expense.amount);
    });

    const total = monthlyExpenses.reduce(function(sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    Object.keys(categoryTotals).forEach(function(category) {
        const amount = categoryTotals[category];
        const percentage = total > 0 ? (amount / total) * 100 : 0;

        const categoryRow = document.createElement("div");
        categoryRow.className = "category-row";

        const heading = document.createElement("div");
        heading.className = "category-heading";

        const categoryName = document.createElement("span");
        categoryName.textContent = category;

        const categoryAmount = document.createElement("span");
        categoryAmount.textContent =
            `₹${amount.toFixed(2)} (${percentage.toFixed(1)}%)`;

        heading.appendChild(categoryName);
        heading.appendChild(categoryAmount);

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";

        const progressFill = document.createElement("div");
        progressFill.className = "progress-fill";
        progressFill.style.width = percentage + "%";

        progressBar.appendChild(progressFill);

        categoryRow.appendChild(heading);
        categoryRow.appendChild(progressBar);

        categorySummary.appendChild(categoryRow);
    });
}

// ==========================================
// PIE CHART
// ==========================================

function displayExpenseChart(monthlyExpenses) {
    const categoryTotals = {};

    monthlyExpenses.forEach(function(expense) {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += Number(expense.amount);
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    const chartCanvas = document.getElementById("expenseChart");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(chartCanvas, {
        type: "pie",

        data: {
            labels: labels,
            datasets: [{
                label: "Expenses",
                data: values
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// ==========================================
// SEARCH EXPENSES
// ==========================================

function getFilteredExpenses() {
    const monthlyExpenses = getMonthlyExpenses();

    const searchText = searchExpense.value.toLowerCase().trim();

    return monthlyExpenses.filter(function(expense) {
        return (
            expense.name.toLowerCase().includes(searchText) ||
            expense.category.toLowerCase().includes(searchText)
        );
    });
}

// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {
    const monthlyExpenses = getMonthlyExpenses();

    const total = monthlyExpenses.reduce(function(sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    const remaining = monthlyBudget - total;

    totalExpenses.textContent = `₹${total.toFixed(2)}`;
    monthlyBudgetElement.textContent = `₹${monthlyBudget.toFixed(2)}`;
    remainingBalance.textContent = `₹${remaining.toFixed(2)}`;

    displayExpenses(getFilteredExpenses());
    displayCategorySummary(monthlyExpenses);
    displayExpenseChart(monthlyExpenses);
}

// ==========================================
// SEARCH EVENT
// ==========================================

searchExpense.addEventListener("input", function() {
    displayExpenses(getFilteredExpenses());
});

// ==========================================
// MONTH FILTER EVENT
// ==========================================

monthFilter.addEventListener("change", function() {
    updateDashboard();
});

// ==========================================
// EXPORT TO CSV
// ==========================================

exportButton.addEventListener("click", function() {
    const filteredExpenses = getFilteredExpenses();

    if (filteredExpenses.length === 0) {
        alert("No transactions available to export!");
        return;
    }

    let csvContent = "Expense Name,Amount,Category,Date\n";

    filteredExpenses.forEach(function(expense) {
        const row = [
            expense.name,
            expense.amount,
            expense.category,
            getExpenseDate(expense)
        ].map(function(value) {
            return '"' + String(value).replace(/"/g, '""') + '"';
        }).join(",");

        csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
        `Student_Expense_Report_${getSelectedMonth()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
});

// ==========================================
// DARK MODE / LIGHT MODE
// ==========================================

const themeButton = document.createElement("button");

themeButton.id = "theme-toggle";
themeButton.textContent = "🌙 Dark Mode";

const dashboardHeader = document.querySelector(".main-content header");

dashboardHeader.appendChild(themeButton);

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☀️ Light Mode";
}

themeButton.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeButton.textContent = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeButton.textContent = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
});

// ==========================================
// INITIAL SETUP
// ==========================================

monthFilter.value = getLocalDateString().slice(0, 7);
expenseDate.value = getLocalDateString();

updateDashboard();
