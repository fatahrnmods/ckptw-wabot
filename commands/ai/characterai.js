const {
    quote
} = require("@mengkodingan/ckptw");
const axios = require("axios");

module.exports = {
    name: "characterai",
    aliases: ["cai"],
    category: "ai",
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, {
            banned: true,
            charger: true,
            cooldown: true
        });
        if (status) return ctx.reply(message);

        const input = ctx.args.join(" ") || null;

        if (!input) return ctx.reply(
            `${quote(global.tools.msg.generateInstruction(["send"], ["text"]))}\n` +
            quote(global.tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "apa itu whatsapp"))
        );

        try {
            const apiUrl = global.tools.api.createUrl("nyxs", "/ai/character-ai", {
                prompt: input,
                gaya: `Bot WhatsApp bernama ${global.config.bot.name}, dimiliki oleh ${global.config.owner.name}.` // Dapat diubah sesuai keinginan Anda.
            });
            const {
                data
            } = await axios.get(apiUrl);

            return ctx.reply(data.result);
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            if (error.status !== 200) return ctx.reply(global.config.msg.notFound);
            return ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};