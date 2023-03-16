import dotenv from "dotenv";
import axios from "axios";
import TelegramBot from "node-telegram-bot-api";

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY) {
  console.error(
    "Please set TELEGRAM_BOT_TOKEN and OPENAI_API_KEY in the .env file"
  );
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt: `User: ${userMessage}\nAI:`,
        max_tokens: 150,
        n: 1,
        stop: null,
        temperature: 0.8,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const aiReply = response.data.choices[0].text.trim();
    bot.sendMessage(chatId, aiReply);
  } catch (error) {
    console.error("Error while processing user message:", error);
    bot.sendMessage(
      chatId,
      "Sorry, I couldn't process your message. Please try again later."
    );
  }
});

console.log("Telegram bot is running...");
