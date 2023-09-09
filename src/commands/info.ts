import { Command } from "@sapphire/framework";
import { Message, EmbedBuilder } from "discord.js";

type InfoData = {
  latency: number;
};

type UptimeData = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

export class InfoCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "info",
      description: "Get some info about me!",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public async messageRun(message: Message) {
    const infoMessage = await message.channel.send("Gathering info...");
    const infoEmbed = this.getInfoEmbed({
      latency: Math.round(
        infoMessage.createdTimestamp - message.createdTimestamp,
      ),
    });
    return infoMessage.edit({
      content: "",
      embeds: [infoEmbed],
    });
  }

  public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const infoMessage = await interaction.deferReply({ fetchReply: true });
    const infoEmbed = this.getInfoEmbed({
      latency: Math.round(
        infoMessage.createdTimestamp - interaction.createdTimestamp,
      ),
    });
    return interaction.editReply({
      embeds: [infoEmbed],
    });
  }

  private getInfoEmbed(data: InfoData): EmbedBuilder {
    const wsHeartbeat = Math.round(this.container.client.ws.ping);
    const uptime = this.getFormattedUptime();
    return new EmbedBuilder()
      .setTitle("Huakesh's Info")
      .setDescription(
        [
          `⌛ **Roundtrip Latency:** ${data.latency}ms`,
          `💓 **Websocket Heartbeat:** ${wsHeartbeat}ms`,
          `🕒 **Uptime:** ${uptime}`,
        ].join("\n"),
      );
  }

  private getFormattedUptime(): string {
    const uptime = this.getUptime();
    const formattedUptime = this.formatUptime(uptime);
    return formattedUptime;
  }

  private getUptime(): UptimeData {
    let leftSeconds = Math.floor(process.uptime());
    const days = Math.floor(leftSeconds / SECONDS_PER_DAY);
    leftSeconds %= SECONDS_PER_DAY;
    const hours = Math.floor(leftSeconds / SECONDS_PER_HOUR);
    leftSeconds %= SECONDS_PER_HOUR;
    const minutes = Math.floor(leftSeconds / SECONDS_PER_MINUTE);
    leftSeconds %= SECONDS_PER_MINUTE;
    const seconds = leftSeconds;
    return { days, hours, minutes, seconds };
  }

  private formatUptime(uptime: UptimeData): string {
    const { days, hours, minutes, seconds } = uptime;
    const formattedUptime = [
      `${days} ${days === 1 ? "day" : "days"}`,
      `${hours} ${hours === 1 ? "hour" : "hours"}`,
      `${minutes} ${minutes === 1 ? "minute" : "minutes"}`,
      `${seconds} ${seconds === 1 ? "second" : "seconds"}`,
    ]
      .filter((t) => !t.startsWith("0"))
      .join(" ");

    if (!formattedUptime) {
      return "Less than a second";
    }
    return formattedUptime;
  }
}
