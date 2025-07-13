/* DOM elements */
const chatWindow = document.querySelector("#chatWindow");
const chatForm = document.querySelector("#chatForm");
const userInput = document.querySelector("#userInput");

// Initial message
displayMessage(
  "Hello! I'm your L'Oréal beauty advisor. How can I help you today?",
  "ai"
);

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${api_Key}`, // Make sure this matches your secrets.js variable name
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messageHistory,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add AI response to history
    messageHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    return aiResponse;
  } catch (error) {
    console.error("Error details:", error);
    if (error.message.includes("API key")) {
      return "Error: Invalid API key. Please check your configuration.";
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
