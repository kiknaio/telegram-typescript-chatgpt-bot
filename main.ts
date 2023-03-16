import dotenv from "dotenv";
import axios from "axios";
import TelegramBot, { MessageEntity } from "node-telegram-bot-api";

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

function isBotMentioned(
  entities: MessageEntity[] | undefined,
  text: string,
  botUsername: string
): boolean {
  if (!entities) return false;

  return entities.some(
    (entity) =>
      entity.type === "mention" &&
      text.substr(entity.offset, entity.length) === `@${botUsername}`
  );
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text as any;

  // Fetch the bot's username
  const botInfo = await bot.getMe();
  const botUsername = botInfo.username as any;

  console.log(msg.entities);

  if (
    isBotMentioned(msg.entities, userMessage, botUsername) ||
    msg.chat.type === "private"
  ) {
    // Remove the bot's mention from the user message {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/engines/text-davinci-003/completions",
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

      console.log(response.data.choices);

      const aiReply = response.data.choices[0].text.trim();
      console.log(aiReply);
      bot.sendMessage(chatId, aiReply);
    } catch (error) {
      console.error("Error while processing user message:", error);
      bot.sendMessage(
        chatId,
        "Sorry, I couldn't process your message. Please try again later."
      );
    }
  }
});

console.log("Telegram bot is running...");
