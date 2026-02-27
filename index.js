const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  Events
} = require("discord.js");

// ================= CONFIG =================
const BOT_TOKEN = "MTQ0NTgwNTYzNjgwMDQ4MzQ0MA.GZTu9C._gazHGQNc5YsgJ--vd1FTIPSrZEOOAaG0hZkpk";
const GUILD_ID = "1335388636878733352";
const CANAL_LOGS = "1442807191437574144"; // pode deixar "" se não quiser
// =========================================

// 🎨 CORES + SIGNIFICADO
const COLORS = {
  alerta:        { color: 0xff0000, label: "🔴 Alerta / Urgente" },
  aviso:         { color: 0xffcc00, label: "🟡 Aviso" },
  informativo:   { color: 0x00cc44, label: "🟢 Informativo" },
  institucional: { color: 0x0099ff, label: "🔵 Institucional" },
  evento:        { color: 0x8a2be2, label: "🟣 Evento" },
  nota:          { color: 0x2f3136, label: "⚫ Nota Oficial" }
};

// CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🧱 EMBED PADRÃO
function buildEmbed({ cor, tipo, texto, imagem, autor }) {
  const embed = {
    title: "",
    description: texto || "*Sem mensagem.*",
    color: cor,
    footer: { text: `🇧🇷 Nação Brasileira • ${tipo}` },
    timestamp: new Date(),
    author: {
      name: autor.tag,
      icon_url: autor.displayAvatarURL()
    }
  };

  if (imagem) embed.image = { url: imagem };
  return embed;
}

// ================= READY =================
client.once(Events.ClientReady, async () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);

  const command = new SlashCommandBuilder()
    .setName("pub")
    .setDescription("Publicar comunicado oficial (todos podem usar)")
    .addStringOption(o =>
      o.setName("tipo")
        .setDescription("Tipo do comunicado")
        .setRequired(true)
        .addChoices(
          ...Object.entries(COLORS).map(([k, v]) => ({
            name: v.label,
            value: k
          }))
        )
    )
    .addStringOption(o =>
      o.setName("mensagem")
        .setDescription("Texto do comunicado")
        .setRequired(true)
    )
    .addAttachmentOption(o =>
      o.setName("imagem")
        .setDescription("Imagem opcional")
    );

  const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

  // ✅ COMANDO DE SERVIDOR (APARECE NA HORA)
  await rest.put(
    Routes.applicationGuildCommands(client.user.id, GUILD_ID),
    { body: [command.toJSON()] }
  );

  console.log("✅ Slash command /pub registrado com sucesso!");
});

// ================= EXECUÇÃO =================
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "pub") return;

  // ✅ TODOS PODEM USAR (SEM RESTRIÇÃO)

  const tipo = interaction.options.getString("tipo");
  const texto = interaction.options.getString("mensagem");
  const imagem = interaction.options.getAttachment("imagem");

  const cfg = COLORS[tipo];

  const embed = buildEmbed({
    cor: cfg.color,
    tipo: cfg.label,
    texto,
    imagem: imagem?.url,
    autor: interaction.user
  });

  await interaction.deferReply({ ephemeral: true });

  // PUBLICA
  await interaction.channel.send({ embeds: [embed] });

  // LOGS (se existir canal)
  const canalLog = interaction.guild.channels.cache.get(CANAL_LOGS);
  if (canalLog) {
    canalLog.send({
      embeds: [{
        title: "📁 LOG DE PUBLICAÇÃO",
        color: cfg.color,
        fields: [
          { name: "Autor", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Tipo", value: cfg.label, inline: true },
          { name: "Canal", value: `<#${interaction.channel.id}>`, inline: true }
        ],
        timestamp: new Date()
      }]
    });
  }

  await interaction.followUp({
    content: "✅ Comunicado publicado com sucesso!",
    ephemeral: true
  });
});

// LOGIN
client.login("MTQ0NTgwNTYzNjgwMDQ4MzQ0MA.GZTu9C._gazHGQNc5YsgJ--vd1FTIPSrZEOOAaG0hZkpk");
