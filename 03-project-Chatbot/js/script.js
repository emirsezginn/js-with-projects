const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn ");

const API_KEY = "your openrouter api is here";
const ACTIVE_MODEL = "deepseek/deepseek-chat-v3-0324:free"; 
const inputHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" 
        ? `<p>$</p>` 
        : `<span class="chatbot-avatar"><i class='bx bxs-invader'></i></span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = async (incomingChatLi) => {
    const messageElement = incomingChatLi.querySelector("p");
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "HTTP-Referer": "http://localhost",
                "X-Title": "Local AI Chat",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: ACTIVE_MODEL,
                messages: [{role: "user", content: userMessage}]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Unknown error");
        
        messageElement.textContent = data.choices[0]?.message?.content;
    } catch (error) {
        console.error("Error:", error);
        messageElement.innerHTML = `<span style="color:red">error: ${error.message}</span>`;
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    const outgoingChatLi = createChatLi(userMessage, "outgoing");
    chatbox.appendChild(outgoingChatLi);
    chatInput.value = "";
    chatbox.scrollTo(0, chatbox.scrollHeight);
    chatInput.style.height = `${inputHeight}px`

    const incomingChatLi = createChatLi("Just give me a sec...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    generateResponse(incomingChatLi);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputHeight}px`
    chatInput.style.height = `${chatInput.scrollHeight}px`
})


chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"))

chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"))


sendChatBtn.addEventListener("click", handleChat);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});
