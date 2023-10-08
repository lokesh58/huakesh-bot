import { Command } from "@sapphire/framework";
import axios from "axios";
import { ApplicationCommandType, EmbedBuilder, codeBlock } from "discord.js";

type CodeExtract = {
  language: string;
  code: string;
};

export class RuncodeCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: "runcode",
      description: "Run the code inside a code block!",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerContextMenuCommand((builder) =>
      builder.setName(this.name).setType(ApplicationCommandType.Message),
    );
  }

  public async contextMenuRun(
    interaction: Command.ContextMenuCommandInteraction,
  ) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const codeExtract = RuncodeCommand.extractCode(
      interaction.targetMessage.content,
    );
    if (!codeExtract) {
      return interaction.reply({
        content: "Code and/or code language not found!",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const codeOutput = await RuncodeCommand.runCode(codeExtract);
    const resultEmbed = new EmbedBuilder()
      .setTitle("Runcode Results")
      .addFields(
        { name: "Language", value: codeExtract.language },
        {
          name: "Code",
          value: codeBlock(codeExtract.language, codeExtract.code),
        },
        { name: "Output", value: codeBlock(codeOutput) },
      );
    return interaction.editReply({
      embeds: [resultEmbed],
    });
  }

  private static extractCode(messageContent: string): CodeExtract | null {
    const [res] = messageContent.matchAll(
      /(?<!\\)(```)(?<=```)(?:([a-z][a-z0-9]*)\s)(.*?)(?<!\\)(?=```)((?:\\\\)*```)/gs,
    );
    if (!res || !res[2] || !res[3]) return null;
    return {
      language: res[2],
      code: res[3],
    };
  }

  private static async runCode(codeExtract: CodeExtract): Promise<string> {
    try {
      const { data } = await axios.post("https://api.codex.jaagrav.in", {
        ...codeExtract,
      });
      const { output, error } = data;
      return output || error;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return err.response?.data.error || "An error occurred!";
      }
      return "An error occurred!";
    }
  }
}
