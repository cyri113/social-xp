import { CommandContext, Context } from "https://deno.land/x/grammy@v1.15.3/mod.ts";

export async function checkOwnership(ctx: CommandContext<Context>, next: void) {
    try {
        const user = await ctx.getAuthor()
        if (user.status !== "creator") "Only the group creator can issue this command."
        await next
    } catch (error: unknown) {
        ctx.reply(String(error))
    }
}