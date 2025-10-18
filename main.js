// Register the datalabels plugin globally
Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const expensesInput = document.getElementById('expenses');
    const priorityPlanSelect = document.getElementById('priority-plan');
    const yearlyRadio = document.getElementById('yearly');
    const monthlyRadio = document.getElementById('monthly');

    const updateChart = () => {
        const isYearly = yearlyRadio.checked;
        const priorityPlan = priorityPlanSelect.value;
        const totalAmount = parseFloat(amountInput.value) || 0;
        const totalExpenses = parseFloat(expensesInput.value) || 0;

        if (totalAmount <= 0) {
            // If no amount, render an empty state
            if (window.myPieChart instanceof Chart) {
                window.myPieChart.destroy();
            }
            return;
        }

        if (totalAmount < totalExpenses) {
            // Optionally handle this case, e.g., show a message
            return;
        }

        const netAmount = totalAmount - totalExpenses;
        const monthlyAmount = isYearly ? netAmount / 12 : netAmount;

        let categories;
        let data;
        let chartTitle = `Distribution of ${isYearly ? 'Yearly' : 'Monthly'} Net Amount`;
        let backgroundColors = [
            '#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'
        ];

        switch (priorityPlan) {


            case '50-30-20':
                categories = ["Needs (50%)", "Wants (30%)", "Savings (20%)"];
                data = [monthlyAmount * 0.5, monthlyAmount * 0.3, monthlyAmount * 0.2];
                chartTitle = '50/30/20 Rule Distribution';
                backgroundColors = ['#8b5cf6', '#ec4899', '#10b981'];
                break;
            case '90-5-5':
                categories = ["Needs (90%)", "Wants (5%)", "Savings (5%)"];
                data = [monthlyAmount * 0.9, monthlyAmount * 0.05, monthlyAmount * 0.05];
                chartTitle = '90/5/5 Rule Distribution';
                backgroundColors = ['#8b5cf6', '#ec4899', '#10b981'];
                break;
            case '60-30-10':
                categories = ["Needs (60%)", "Wants (30%)", "Savings (10%)"];
                data = [monthlyAmount * 0.6, monthlyAmount * 0.3, monthlyAmount * 0.1];
                chartTitle = '90/5/5 Rule Distribution';
                backgroundColors = ['#8b5cf6', '#ec4899', '#10b981'];
                break;
            case'10-45-35':
                categories = ["Needs (10%)", "Wants (45%)", "Savings (35%)"];
                data = [monthlyAmount * 0.10, monthlyAmount * 0.45, monthlyAmount * 0.35];
                chartTitle = '90/5/5 Rule Distribution';
                backgroundColors = ['#8b5cf6', '#ec4899', '#10b981'];
                break;
            case 'savings-focused':
                categories = ["Savings (50%)", "Housing (20%)", "Food (15%)", "Utilities (10%)", "Other (5%)"];
                data = [monthlyAmount * 0.5, monthlyAmount * 0.2, monthlyAmount * 0.15, monthlyAmount * 0.1, monthlyAmount * 0.05];
                chartTitle = 'Savings-Focused Distribution';
                backgroundColors = ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6', '#6366f1'];
                break;
            case 'even':
            default:
                categories = ["Housing", "Transportation", "Food", "Utilities", "Entertainment", "Savings"];
                const distributedAmount = monthlyAmount / categories.length;
                data = categories.map(() => distributedAmount);
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

    // Initial chart render
    updateChart();

    // Add event listeners to all inputs to update the chart automatically
    amountInput.addEventListener('input', updateChart);
    expensesInput.addEventListener('input', updateChart);
    priorityPlanSelect.addEventListener('change', updateChart);
    yearlyRadio.addEventListener('change', updateChart);
    monthlyRadio.addEventListener('change', updateChart);

    // Add a listener for the AI button
    document.getElementById('ai-help').addEventListener('click', () => {
        alert("AI Help feature is coming soon!");
    });
});
