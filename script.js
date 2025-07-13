/* DOM elements */
const chatWindow = document.querySelector("#chatWindow");
const chatForm = document.querySelector("#chatForm");
const userInput = document.querySelector("#userInput");

// Initial message
displayMessage(
  "Hello! I'm your L'Oréal beauty advisor. How can I help you today?",
  "ai"
);

// Configuration - Replace with your Cloudflare Worker URL
const CLOUDFLARE_WORKER_URL =
  "https://lorealworker.rzaw001.workers.dev";

// Store conversation history
let messageHistory = [
  {
    role: "system",
    content:
      "You are a L'Oréal beauty advisor. Provide helpful advice about L'Oréal products, skincare routines, and beauty tips. Keep responses concise and professional.",
  },
];

async function callChatGPT(userMessage) {
  try {
    // Add user message to history
    messageHistory.push({
      role: "user",
      content: userMessage,
    });

    // Send request to Cloudflare Worker instead of directly to OpenAI
    const response = await fetch(CLOUDFLARE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messageHistory, // Send the entire conversation history
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Worker Error:", errorData);
      throw new Error(errorData.error?.message || "Worker request failed");
    }

    // Get the response data from Cloudflare Worker
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add AI response to history for future context
    messageHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    return aiResponse;
  } catch (error) {
    console.error("Error details:", error);
    if (error.message.includes("Worker")) {
      return "Error: Unable to connect to the AI service. Please check your Cloudflare Worker configuration.";
    }
    return "I apologize, but I am having trouble connecting right now. Please try again later.";
  }
}

function displayMessage(message, type) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", type);
  msgDiv.textContent = message;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return msgDiv; // Return the element so it can be removed later
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInput.value.trim();

  if (!userMessage) return;

  // Display user message
  displayMessage(userMessage, "user");
  userInput.value = "";

  // Show loading state
  const loadingMsg = displayMessage("Thinking...", "ai");

  // Get and display AI response
  const aiResponse = await callChatGPT(userMessage);
  chatWindow.removeChild(loadingMsg);
  displayMessage(aiResponse, "ai");
});
