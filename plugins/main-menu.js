const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');
const axios = require('axios');

function toSmallCaps(str) {
  const smallCaps = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.toUpperCase().split('').map(c => smallCaps[c] || c).join('');
}

cmd({
  pattern: "menu",
  alias: ["allmenu", "gotar"],
  use: '.menu',
  desc: "Show all bot commands",
  category: "menu",
  react: "🍷",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
    const totalCommands = commands.length;
    const sender = m.sender;
    const date = moment().tz("America/Port-au-Prince").format("dddd, DD MMMM YYYY");

    const uptimeFormatted = (() => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    })();

    let menuText = `
╭━━━━━━━━━━━━━🌟 〘 *ZARYA MD* 〙 🌟━━━━━━━━━━━━━╮
┃ 🔹 👤 Utilisateur : *@${sender.split('@')[0]}*
┃ 🔹 ⏱️ Uptime     : *${uptimeFormatted}*
┃ 🔹 ⚙️ Mode       : *${config.MODE}*
┃ 🔹 💠 Préfixe    : *[${config.PREFIX}]*
┃ 🔹 📦 Modules    : *${totalCommands}*
┃ 🔹 👨‍💻 Développeur: *DAWENS BOY🩸*
┃ 🔹 🔖 Version    : *1.0.0 aura💀🍷*
┃ 🔹 📆 Date       : *${date}*
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃
┃          💻  Merci d'utiliser ZARYA MD! 💻          
╰━━━━━━━━━━━━━━━━━━━━━━━⚡━━━━━━━⚡━━━━━━━━━━━━━━╯

🩸 *_WELCOME TO ZARYA MD_* 🩸
`;

    // Organize commands by category
    let category = {};
    for (let cmd of commands) {
      if (!cmd.category) continue;
      if (!category[cmd.category]) category[cmd.category] = [];
      category[cmd.category].push(cmd);
    }

    const keys = Object.keys(category).sort();

    for (const key of keys) {
      menuText += `\n══════════════════\n✨ *${key.toUpperCase()}* ✨\n`;

      const cmds = category[key]
        .filter(cmd => cmd.pattern)
        .sort((a, b) => a.pattern.localeCompare(b.pattern));

      cmds.forEach(cmd => {
        const usage = cmd.pattern.split('|')[0];
        menuText += ` ⤷  ${toSmallCaps(usage)}\n`;
      });

      menuText += `╰═══════════════════════════╯\n`;
    }

    // ✅ Send menu without buttons
    await conn.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/pbamxw.jpeg' },
      caption: menuText,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: config.newsletterJid || '120363419768812867@newsletter',
          newsletterName: 'ZARYA-𝐌𝐃',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // ✅ Optional: Send PTT voice
    await conn.sendMessage(from, {
      audio: { url: 'https://files.catbox.moe/8e7mkq.mp4' },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: mek });

  } catch (e) {
    console.error("❌ MENU ERROR:", e);
    reply(`❌ Error: ${e.message}`);
  }
});
