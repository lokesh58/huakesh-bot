import z from "zod";
import "dotenv/config";

const envSchema = z.object({
  TOKEN: z.string(),
});

const env = envSchema.parse(process.env);

export default {
  token: env.TOKEN,
};
