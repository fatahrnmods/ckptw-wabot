const {
    monospace,
    quote
} = require("@mengkodingan/ckptw");
const {
    MessageType
} = require("@mengkodingan/ckptw/lib/Constant");
const axios = require("axios");
const FormData = require("form-data");
const Jimp = require("jimp");
const mime = require("mime-types");

module.exports = {
    name: "hd",
    aliases: ["enhance", "enhancer", "hd", "hdr", "remini", "upscale", "upscaler"],
    category: "tools",
    code: async (ctx) => {
        const {
            status,
            message
        } = await global.handler(ctx, {
            banned: true,
            charger: true,
            cooldown: true,
            energy: [5, "image", 3]
        });
        if (status) return ctx.reply(message);

        const msgType = ctx.getMessageType();

        if (!(await global.tools.general.checkMedia(msgType, ["image"], ctx)) || !(await global.tools.general.checkQuotedMedia(ctx.quoted, ["image"]))) return ctx.reply(quote(global.tools.msg.generateInstruction(["send", "reply"], ["image"])));

        try {
            const buffer = await ctx.msg.media.toBuffer() || await ctx.quoted?.media.toBuffer();
            const result = await upscale(buffer, ctx.args[0], ctx.args[1] === "anime" ? true : false);

            return await ctx.reply({
                image: {
                    url: result.image
                },
                caption: `${quote(`Anda bisa mengaturnya. Tersedia ukuran 2, 4, 6, 8, dan 16, defaultnya adalah 2. Gunakan ${monospace("anime")} jika gambarnya anime.`)}\n` +
                    quote(global.tools.msg.generateCommandExample(ctx._used.prefix + ctx._used.command, "16 anime")),
                mimetype: mime.contentType("png")
            });
        } catch (error) {
            console.error(`[${global.config.pkg.name}] Error:`, error);
            if (error.status !== 200) return ctx.reply(global.config.msg.notFound);
            return ctx.reply(quote(`❎ Terjadi kesalahan: ${error.message}`));
        }
    }
};

// Dibuat oleh ZTRdiamond.
async function upscale(buffer, size = 2, anime = false) {
    if (!buffer) throw new Error("undefined buffer input!");
    if (!Buffer.isBuffer(buffer)) throw new Error("invalid buffer input");
    if (!/(2|4|6|8|16)/.test(size.toString())) throw new Error("invalid upscale size!");

    const image = await Jimp.read(buffer);
    const {
        width,
        height
    } = image.bitmap;
    const newWidth = width * size;
    const newHeight = height * size;

    const form = new FormData();
    form.append("name", "upscale-" + Date.now());
    form.append("imageName", "upscale-" + Date.now());
    form.append("desiredHeight", newHeight.toString());
    form.append("desiredWidth", newWidth.toString());
    form.append("outputFormat", "png");
    form.append("compressionLevel", "none");
    form.append("anime", anime.toString());
    form.append("image_file", buffer, {
        filename: "upscale-" + Date.now() + ".png",
        contentType: 'image/png',
    });

    const apiUrl = global.tools.api.createUrl("https://api.upscalepics.com", "/upscale-to-size", {});
    const response = await axios.post(apiUrl, form, {
        headers: {
            ...form.getHeaders(),
            origin: "https://upscalepics.com",
            referer: "https://upscalepics.com"
        }
    });

    const data = response.data;
    if (data.error) throw new Error("Error from upscaler API!");

    return {
        status: true,
        image: data.bgRemoved
    };
}