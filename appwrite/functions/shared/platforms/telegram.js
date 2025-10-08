import axios from "axios";
import { env } from "../env.js";

export async function postToTelegram({ botToken, chatId, message }) {
  if (!botToken) {
    throw new Error("Telegram bot token is required");
  }
  if (!chatId) {
    throw new Error("Telegram chat/channel id is required");
  }

  await axios.post(
    `${env.telegramApiBase()}/bot${botToken}/sendMessage`,
    {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    },
    {
      timeout: 10000,
    }
  );
}
