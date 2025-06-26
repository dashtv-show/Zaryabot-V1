const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "ping",
    desc: "Check bot's response speed.",
    category: "main",
    react: "🏓",
    filename: __filename,
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        const start = performance.now();
        const sentMsg = await conn.sendMessage(from, { text: "*🔄 Pinging...*" });
        const end = performance.now();
        const ping = (end - start).toFixed(2);

        await conn.sendMessage(from, {
            text: `╭───⟪ *ZARYA-MD* ⟫───╮\n│  ⚡ *Response:* ${ping} ms\n╰────────────────────╯`,
        }, { quoted: sentMsg });

    } catch (err) {
        console.error("Ping Error:", err);
        reply(`❌ Error:\n${err.message}`);
    }
});
