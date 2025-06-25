const { cmd } = require('../command');
const { File } = require('megajs');
const { default: makeWASocket } = require('@whiskeysockets/baileys');

// Global session storage
global.jadibotSessions = global.jadibotSessions || {};

cmd({
  pattern: 'deploy',
  desc: '🚀 Deploy WhatsApp session via MEGA backup.',
  category: 'tools',
  react: '🪛',
  filename: __filename
}, async (conn, m, { text }) => {
  if (!text) {
    return m.reply('❌ *Please provide a MEGA Session ID!*\n\n✅ Example:\n.deploy JESUS~CRASH~V1~<file_id>#<file_key>');
  }

  // ✅ REGEX FIXED: now accepts full MEGA file keys
  const match = text.trim().match(/^JESUS~CRASH~V1~([^#]+)#(.+)$/);
  if (!match) {
    return m.reply('❌ *Invalid session format.*\n\nUse:\n.deploy JESUS~CRASH~V1~<file_id>#<file_key>');
  }

  const [, fileId, fileKey] = match;

  if (global.jadibotSessions[fileId]) {
    return m.reply('⚠️ *Session already active.*');
  }

  if (Object.keys(global.jadibotSessions).length >= 5) {
    return m.reply('⚠️ *Limit reached (max 5 sessions allowed at once).*');
  }

  try {
    m.reply(`📥 *Fetching session...*\nID: \`${fileId}\``);

    const sessionFile = File.fromURL(`https://mega.nz/#!${fileId}!${fileKey}`);
    const stream = await sessionFile.download();

    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const sessionJson = JSON.parse(Buffer.concat(chunks).toString());

    // ✅ Ensure valid structure
    if (!sessionJson.creds || typeof sessionJson.creds !== 'object') {
      return m.reply('❌ *Invalid session JSON: missing or invalid `creds` field.*');
    }

    const sock = makeWASocket({
      auth: {
        creds: sessionJson.creds,
        keys: sessionJson.keys || {}
      },
      printQRInTerminal: false,
      browser: ['Jesus-Crash-Deploy', 'Firefox', '121.0.0']
    });

    global.jadibotSessions[fileId] = sock;
    m.reply('⏳ *Connecting session... please wait.*');

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'open') {
        m.reply(`✅ *Session \`${fileId}\` connected successfully!*`);
        console.log(`✅ [CONNECTED] ${fileId}`);
      } else if (connection === 'close') {
        delete global.jadibotSessions[fileId];
        const reason = lastDisconnect?.error?.output?.statusCode || 'Unknown';
        console.log(`❌ [DISCONNECTED] ${fileId} | Reason: ${reason}`);
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg?.message) return;

      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = isGroup ? msg.key.participant : from;
      const content = msg.message.conversation || msg.message.extendedTextMessage?.text;

      if (content?.toLowerCase() === 'ping') {
        await sock.sendMessage(from, {
          text: `🏓 *Pong!* \nHello <@${sender.split('@')[0]}> 👋`,
          mentions: [sender]
        }, { quoted: msg });
      }
    });

  } catch (err) {
    console.error(`[DEPLOY ERROR]`, err);
    m.reply(`❌ *Deployment failed:*\n${err.message || err}`);
  }
});
