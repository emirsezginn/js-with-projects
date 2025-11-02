const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn ");

const API_KEY = "YOUR_API_KEY";
const MODELS = [
    "minimax/minimax-m2:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "deepseek/deepseek-coder:free",
  "phi-3/medium-128k:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "openchat/openchat-7b:free"
];
let currentModelIndex = 0; 
const inputHeight = chatInput.scrollHeight;

// Global değişken tanımla
let userMessage = "";
let isProcessing = false; // Concurrent request önlemek için

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" 
        ? `<p></p>` 
        : `<span class="chatbot-avatar"><i class='bx bxs-invader'></i></span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = async (incomingChatLi) => {
    const messageElement = incomingChatLi.querySelector("p");
    
    try {
        // Tüm modelleri dene
        for (let attempts = 0; attempts < MODELS.length; attempts++) {
            try {
                const currentModel = MODELS[currentModelIndex];
                console.log(`Trying model: ${currentModel} (attempt ${attempts + 1})`);
                
                // Timeout için AbortController
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${API_KEY}`,
                        "HTTP-Referer": window.location.origin,
                        "X-Title": "AI Chatbot",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: currentModel,
                        messages: [{
                            role: "user", 
                            content: userMessage
                        }],
                        max_tokens: 1000,
                        temperature: 0.7
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log(`Model ${currentModel} response status:`, response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log("✅ Success with model:", currentModel);

                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        const botMessage = data.choices[0].message.content.trim();
                        messageElement.textContent = botMessage;
                        return; // Başarılı, çık
                    }
                } else if (response.status === 429) {
                    // Bu model rate limited, bir sonrakini dene
                    console.log(`⏳ Model ${currentModel} is rate limited, trying next...`);
                    currentModelIndex = (currentModelIndex + 1) % MODELS.length;
                    continue;
                } else if (response.status === 400) {
                    // Invalid model, bir sonrakini dene
                    const errorData = await response.text();
                    console.log(`❌ Model ${currentModel} is invalid:`, JSON.parse(errorData).error.message);
                    currentModelIndex = (currentModelIndex + 1) % MODELS.length;
                    continue;
                } else {
                    // Diğer hatalar için hemen çık
                    const errorData = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorData}`);
                }

            } catch (innerError) {
                // Extension hatalarını filtrele
                if (innerError.message && innerError.message.includes('message port closed')) {
                    console.log('Browser extension interference detected, continuing...');
                    continue;
                }
                
                console.error(`Error with model ${MODELS[currentModelIndex]}:`, innerError);
                
                if (innerError.name === 'AbortError') {
                    messageElement.innerHTML = `<span style="color:red">Request timeout. Please try again.</span>`;
                    return;
                }
                
                // Son deneme değilse devam et
                if (attempts < MODELS.length - 1) {
                    currentModelIndex = (currentModelIndex + 1) % MODELS.length;
                    continue;
                } else {
                    // Tüm modeller başarısız
                    messageElement.innerHTML = `<span style="color:red">All models are currently unavailable. Please try again later.</span>`;
                    return;
                }
            }
        }
    } catch (outerError) {
        console.error("Unexpected error:", outerError);
        messageElement.innerHTML = `<span style="color:red">Unexpected error occurred. Please try again.</span>`;
    } finally {
        // MUTLAKA isProcessing'i false yap
        isProcessing = false;
        chatbox.scrollTo(0, chatbox.scrollHeight);
        console.log("Request completed, isProcessing set to false");
    }
}

const handleChat = () => {
    // Debug log
    console.log("handleChat called, isProcessing:", isProcessing);
    
    // Zaten işlem devam ediyorsa engelle
    if (isProcessing) {
        console.log("Already processing a request - blocking new request");
        return;
    }

    userMessage = chatInput.value.trim();
    if (!userMessage) {
        console.log("Empty message - returning");
        return;
    }

    console.log("Starting new chat request:", userMessage);
    isProcessing = true;

    // Kullanıcı mesajını ekle
    const outgoingChatLi = createChatLi(userMessage, "outgoing");
    chatbox.appendChild(outgoingChatLi);
    
    // Input'u temizle
    chatInput.value = "";
    chatbox.scrollTo(0, chatbox.scrollHeight);
    chatInput.style.height = `${inputHeight}px`;

    // Bot mesajı için placeholder ekle
    const incomingChatLi = createChatLi("Just give me a sec...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    // Response oluştur
    generateResponse(incomingChatLi);
}

// Event listeners
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

sendChatBtn.addEventListener("click", handleChat);

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});
