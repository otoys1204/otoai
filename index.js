const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require('uuid'); // <-- Tambahkan ini untuk ID unik

dotenv.config();

// Pastikan Anda sudah install uuid: npm install uuid
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Objek untuk menyimpan semua sesi chat yang aktif
const chatSessions = {};

// Fungsi untuk membuat sesi chat baru
function createNewChatSession(chatId) {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });
    chatSessions[chatId] = model.startChat({
        history: [],
        generationConfig: {
            temperature: 0.9,
            topP: 1,
            topK: 1,
        },
        systemInstruction: {
            role: "user",
            parts: [
                {
                    text: `Kamu adalah OTO AI, asisten AI yang ramah, santai, dan suka ngobrol seru! 😄
- Gunakan emoji dengan natural, jangan dipaksain
- Gaya ngobrolnya harus hangat, kayak temen deket, bukan kayak robot
- Hindari bahasa yang terlalu formal atau kaku
- Tetap bantuin user dengan jelas, tapi sambil tetap asik & fun`.trim(),
                }
            ]
        }
    });
    console.log(`Sesi chat baru dibuat dengan ID: ${chatId}`);
}

// Endpoint untuk membuat chat baru dan mendapatkan ID
app.post('/new-chat', (req, res) => {
    const chatId = uuidv4(); // Buat ID unik untuk sesi chat baru
    createNewChatSession(chatId);
    res.json({ chatId });
});

// Endpoint untuk mengirim prompt
app.post('/generate-text', async (req, res) => {
    const { prompt, chatId } = req.body;

    if (!prompt) return res.status(400).json({ error: 'prompt wajib diisi' });
    if (!chatId) return res.status(400).json({ error: 'chatId wajib diisi' });

    // Cek apakah sesi chat ada, jika tidak, buat baru
    if (!chatSessions[chatId]) {
        console.log(`Sesi chat ${chatId} tidak ditemukan, membuat yang baru.`);
        createNewChatSession(chatId);
    }

    try {
        const chat = chatSessions[chatId];
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const output = response.text().trim();
        res.json({ output });
    } catch (error) {
        console.error("Error saat generate text:", error);
        res.status(500).json({ error: error.message });
    }
});

// Serve HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
    console.log(`server running on http://localhost:3000` );
});
