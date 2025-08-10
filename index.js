//const http = require("http")

//const server = http.createServer((req, res) => {
//   res.write("hello");
//   res.end();
//})
//server.listen(3000, () =>{
    // console.log(`server running on http://localhost:3000`)
//});
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const path = require("path"); // <--- tambahkan ini
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();

app.use(express.json());
app.use(express.static(__dirname));


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: 'models/gemini-2.0-flash'});
const chat = model.startChat({
  history:[],
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
async function generativeAIContent(prompt) {
 try {
  const result = await chat.sendMessage(prompt)
  return(await result.response).text().trim();
 }
 catch (error) {
  throw new Error(error.messge);
 }
}

app.use(express.json());

app.post('/generate-text', async (req,res)=> {
  console.log('REQ BODY:', req.body);
  const {prompt} = req.body;
  if (!prompt) return res.status(400).json({error: 'prompt wajib diisi'});
  try {
    const output = await generativeAIContent(prompt);
    res.json({ output });
  }
 catch (error) {
  res.status(500).json({error: error.message});
 }
});

// Serve HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
app.post("/hello", (req, res) => {
const name = req.body.name;
res.send (`hello. ${name}`)

})
app.listen(3000, () =>{
     console.log(`server running on http://localhost:3000`)
});