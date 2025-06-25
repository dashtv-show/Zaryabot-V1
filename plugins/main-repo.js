const fetch = require('node-fetch');
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch GitHub repository information",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {

    const githubRepoURL = 'https://github.com/DAWENS-BOY96/Zaryabot-V1';

    try {
        const match = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return reply("❌ Erreur : L'URL du repo est invalide.");

        const [, username, repoName] = match;

        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
            headers: { 'User-Agent': 'ZARYA-MD' }
        });

        if (response.status === 503) {
            return reply("❌ GitHub est temporairement indisponible (503). Réessaie plus tard.");
        }

        if (!response.ok) {
            return reply(`❌ Échec de récupération des infos du repo. Code: ${response.status}`);
        }

        const repoData = await response.json();

        const message = `
╭━━━〘 *ZARYA-MD REPO* 〙━━━╮
┃ 🗂️ *Nom:* ${repoData.name}
┃ 👤 *Auteur:* ${repoData.owner.login}
┃ ⭐ *Étoiles:* ${repoData.stargazers_count}
┃ 🍴 *Forks:* ${repoData.forks_count}
┃ 🔗 *Lien:* ${repoData.html_url}
┃ 📝 *Desc:* ${repoData.description || 'Aucune description'}
╰━━━━━━━━━━━━━━━━━━━━━━━╯
📂 *Power by:* ᴀᴜᴛʜᴏʀ — DAWENS BOY
        `.trim();

        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/pbamxw.jpeg' },
            caption: message,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363419768812867@newsletter',
                    newsletterName: config.OWNER_NAME || 'ZARYA-MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("❌ Repo command error:", error);
        reply("❌ Une erreur est survenue lors de la récupération du dépôt.");
    }
});
