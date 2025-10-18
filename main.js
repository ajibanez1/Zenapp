// Register the datalabels plugin globally
Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const priorityPlanSelect = document.getElementById('priority-plan');
    const yearlyRadio = document.getElementById('yearly');
    const monthlyRadio = document.getElementById('monthly');
    const expenseForm = document.getElementById('expense-form');
    const expenseDescriptionInput = document.getElementById('expense-description');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseListContainer = document.getElementById('expense-list-container');

    let expenses = [];

    const renderExpenses = () => {
        expenseListContainer.innerHTML = '';
        if (expenses.length === 0) {
            expenseListContainer.innerHTML = '<p class="text-center text-gray-500">No expenses added yet.</p>';
        } else {
            expenses.forEach(expense => {
                const expenseEl = document.createElement('div');
                expenseEl.className = 'expense-list-item';
                expenseEl.innerHTML = `
                    <span class="expense-item-text">${expense.description}</span>
                    <div class="flex items-center gap-4">
                        <span class="expense-item-amount">-$${expense.amount.toFixed(2)}</span>
                        <button class="remove-expense-button" data-id="${expense.id}">&times;</button>
                    </div>
                `;
                expenseListContainer.appendChild(expenseEl);
            });
        }
    };

    const updateChart = () => {
        const isYearly = yearlyRadio.checked;
        const priorityPlan = priorityPlanSelect.value;
        const totalAmount = parseFloat(amountInput.value) || 0;
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        if (totalAmount <= 0) {
            if (window.myPieChart instanceof Chart) {
                window.myPieChart.destroy();
            }
            return;
        }

        const netAmount = totalAmount - totalExpenses;
        const monthlyAmount = isYearly ? netAmount / 12 : netAmount;

        if (netAmount < 0) {
            if (window.myPieChart instanceof Chart) {
                window.myPieChart.destroy();
            }
            // Optionally show a message that expenses exceed income
            return;
        }

        const categories = ["Housing", "Transportation", "Food", "Utilities", "Entertainment", "Savings"];
        let percentages;
        let data;
        let chartTitle = `Distribution of ${isYearly ? 'Yearly' : 'Monthly'} Net Amount`;
        let backgroundColors = [
            '#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'
        ];

        switch (priorityPlan) {
            case 'balanced':
                // Housing: 35%, Transportation: 15%, Food: 15%, Utilities: 10%, Entertainment: 10%, Savings: 15%
                percentages = [0.35, 0.15, 0.15, 0.10, 0.10, 0.15];
                data = percentages.map(p => monthlyAmount * p);
                chartTitle = 'Balanced Plan Distribution';
                break;
            case 'savings-focused':
                // Housing: 25%, Transportation: 10%, Food: 10%, Utilities: 5%, Entertainment: 5%, Savings: 45%
                percentages = [0.25, 0.10, 0.10, 0.05, 0.05, 0.45];
                data = percentages.map(p => monthlyAmount * p);
                chartTitle = 'Savings-Focused Distribution';
                break;
            case 'even':
            default:
                const distributedAmount = monthlyAmount / categories.length;
                data = categories.map(() => distributedAmount);
                chartTitle = 'Even Distribution';
                break;
        }

        const ctx = document.getElementById('myPieChart').getContext('2d');

        if (window.myPieChart instanceof Chart) {
            window.myPieChart.destroy();
        }

        window.myPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Expense Distribution',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#fff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: chartTitle,
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                const value = context.raw;
                                const percentage = ((value / monthlyAmount) * 100).toFixed(1);
                                label += `$${value.toFixed(2)} (${percentage}%)`;
                                return label;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            const percentage = ((value / monthlyAmount) * 100).toFixed(1) + '%';
                            return percentage;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        }
                    }
                }
            }
        });
    };

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = expenseDescriptionInput.value;
        const amount = parseFloat(expenseAmountInput.value);

        if (description && amount > 0) {
            expenses.push({ id: Date.now(), description, amount });
            expenseDescriptionInput.value = '';
            expenseAmountInput.value = '';
            renderExpenses();
            updateChart();
        }
    });

    expenseListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-expense-button')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            expenses = expenses.filter(exp => exp.id !== id);
            renderExpenses();
            updateChart();
        }
    });

    // Initial renders
    renderExpenses();
    updateChart();

    // Add event listeners to update the chart automatically
    amountInput.addEventListener('input', updateChart);
    priorityPlanSelect.addEventListener('change', updateChart);
    yearlyRadio.addEventListener('change', updateChart);
    monthlyRadio.addEventListener('change', updateChart);

    // Add a listener for the AI button
    document.getElementById('ai-help').addEventListener('click', () => {
        alert("AI Help feature is coming soon!");
    });
});
