import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// IMPORTANT: You must get your own API key from Google AI Studio.
// https://aistudio.google.com/app/apikey
const API_KEY = "AIzaSyBjJGXzL4veoMNltfdzE3B-hUzAZaWgUf4"; // <-- PASTE YOUR GEMINI API KEY HERE



const genAI = new GoogleGenerativeAI(API_KEY);

export async function getAIBudgetDistribution(userInput, categories, currentPercentages) {

    if (!userInput || !categories || categories.length === 0) {
        return null;
    }

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        generationConfig: {
            response_mime_type: "application/json",
        },
    });

    const prompt = `
        You are a helpful budgeting assistant. The user wants to adjust their budget.
        The current budget categories are: ${categories.join(", ")}.
        The user's request is: "${userInput}".

        Your task is to return a JSON object that adheres to the following schema:
        {
          "type": "object",
          "properties": {
            "Housing": { "type": "number" },
            "Transportation": { "type": "number" },
            "Food": { "type": "number" },
            "Utilities": { "type": "number" },
            "Entertainment": { "type": "number" },
            "Savings": { "type": "number" }
          },
          "required": ["Housing", "Transportation", "Food", "Utilities", "Entertainment", "Savings"]
        }

        The sum of all percentage values in the JSON object you return must be exactly 100.
        Based on the user's request, provide the new budget distribution.
    `;
    
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const budget = JSON.parse(text);

        // --- Validation ---
        const total = Object.values(budget).reduce((sum, val) => sum + val, 0);
        if (total < 99 || total > 101) { // Allow for small rounding errors
            throw new Error("AI response percentages do not add up to 100.");
        }
        
        // Ensure all categories are present
        for (const category of categories) {
            if (budget[category] === undefined) {
                budget[category] = 0; // Assign 0 if missing
            }
        }

        return budget;

    
}
