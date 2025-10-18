import { getAIBudgetDistribution } from './gemini.js';

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
    const aiHelpButton = document.getElementById('ai-help');
    const aiModal = document.getElementById('ai-modal');
    const aiSubmitButton = document.getElementById('ai-submit');
    const aiCancelButton = document.getElementById('ai-cancel');
    const aiInput = document.getElementById('ai-input');

    let expenses = [];
    let currentPercentages = {}; // To store the current distribution

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

    const updateChart = (aiDistribution = null) => {
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

        // Combine default categories with expenses
        let categories = ["Housing", "Transportation", "Food", "Utilities", "Entertainment", "Savings"];
        let backgroundColors = [
            '#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'
        ];
        
        // Add expenses to categories and colors
        expenses.forEach(expense => {
            categories.push(expense.description);
            // Generate a random color for the expense
            backgroundColors.push('#' + Math.floor(Math.random()*16777215).toString(16));
        });

        let percentages;
        let data;
        let chartTitle = `Distribution of ${isYearly ? 'Yearly' : 'Monthly'} Amount`;

        if (aiDistribution) {
            // Use distribution from AI
            percentages = categories.map(cat => (aiDistribution[cat] || 0) / 100);
            data = percentages.map(p => monthlyAmount * p);
            chartTitle = 'AI-Generated Budget';
            priorityPlanSelect.value = 'even'; // Reset dropdown to a neutral state
        } else {
            // Use distribution from dropdown
            switch (priorityPlan) {
                case 'balanced':
                    percentages = [0.35, 0.15, 0.15, 0.10, 0.10, 0.15];
                    chartTitle = 'Balanced Plan';
                    break;
                case 'savings-focused':
                    percentages = [0.25, 0.10, 0.10, 0.05, 0.05, 0.45];
                    chartTitle = 'Savings-Focused Plan';
                    break;
                case 'even':
                default:
                    const evenPercentage = 1 / 6; // Only divide by original categories
                    percentages = Array(6).fill(evenPercentage);
                    chartTitle = 'Even Distribution';
                    break;
            }
            
            // Calculate the remaining amount after expenses
            const remainingAmount = monthlyAmount - totalExpenses;
            
            // Calculate values for the original categories
            data = percentages.map(p => remainingAmount * p);
            
            // Add expense amounts to data array
            expenses.forEach(expense => {
                data.push(expense.amount);
            });
        }

        // Store current percentages for the AI
        currentPercentages = {};
        categories.forEach((cat, index) => {
            currentPercentages[cat] = percentages[index] * 100;
        });

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
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14,
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: chartTitle,
                        font: {
                            size: 18,
                            family: "'Inter', sans-serif",
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
                            if (value === 0) return '';
                            const percentage = ((value / monthlyAmount) * 100).toFixed(1) + '%';
                            return percentage;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14,
                            family: "'Inter', sans-serif"
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
    amountInput.addEventListener('input', () => updateChart());
    priorityPlanSelect.addEventListener('change', () => updateChart());
    yearlyRadio.addEventListener('change', () => updateChart());
    monthlyRadio.addEventListener('change', () => updateChart());

    // --- AI Modal Logic ---
    aiHelpButton.addEventListener('click', () => {
        aiModal.classList.remove('hidden');
    });

    aiCancelButton.addEventListener('click', () => {
        aiModal.classList.add('hidden');
    });

    aiSubmitButton.addEventListener('click', async () => {
        const userInput = aiInput.value;
        if (!userInput) {
            alert("Please enter a command for the AI.");
            return;
        }

        aiSubmitButton.textContent = "Thinking...";
        aiSubmitButton.disabled = true;

        const categories = ["Housing", "Transportation", "Food", "Utilities", "Entertainment", "Savings"];
        const newDistribution = await getAIBudgetDistribution(userInput, categories, currentPercentages);

        aiSubmitButton.textContent = "Update Budget";
        aiSubmitButton.disabled = false;

        if (newDistribution) {
            updateChart(newDistribution);
            aiModal.classList.add('hidden');
            aiInput.value = '';
        }
    });
});
