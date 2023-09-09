import { SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";
import config from "./config";

const client = new SapphireClient({
  baseUserDirectory: __dirname,
  loadMessageCommandListeners: true,
  defaultPrefix: "!",
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

async function loginClient() {
  try {
    await client.login(config.token);
    client.logger.info(`Logged in as ${client.user?.username}`);
  } catch (err) {
    client.logger.fatal(`Error while logging in:\n${err}`);
    client.destroy().catch(console.error);
  }
}

loginClient();
