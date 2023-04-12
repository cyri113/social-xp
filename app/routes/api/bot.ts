import { Bot } from "https://deno.land/x/grammy@v1.15.3/mod.ts";
import { connect } from "../../lib/connect.ts";
import { checkOwnership } from "../../lib/middleware/checkOwnership.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";

const env = await load();

const bot = new Bot(env.BOT_TOKEN)

bot.command("connect", async ctx => checkOwnership(ctx, await connect(ctx)))