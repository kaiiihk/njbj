const { Client, Collection, REST, Routes, Embed } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [1, 512, 32768, 2, 128] });

client.commands = new Collection();
const commandFolders = fs.readdirSync('./commands');
const token = "MTE1NDk4MDU0MTcxMjU2ODM1MA.GH8Ed1.0L_Sen2TQ6s4CBD_tFom7sUWy1ve2SpC6XIStQ";

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

const commands = [];
client.commands.forEach((command) => {
  commands.push(command.toJSON());
});

client.once('ready', async () => {
  console.log('Bot online!');

  try {
    const guildId = '1107710583127670874';
    const clientId = client.user.id;
    const rest = new REST({ version: '9' }).setToken(token);

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: client.commands }
    );

    console.log('Slash commands registrados com sucesso!');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

// Requerimentos para os projetos abaixo
const { ActionRowBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, ButtonBuilder } = require("discord.js")

// Exibição de pix
client.on("messageCreate", (message) => {
  if (message.content === "!pix") {
    const embedpix = new EmbedBuilder()
      .setTitle("💳Pagamento pix:")
      .setDescription(`Chave pix: \`2daff1c9-de7d-49ed-bd2e-86ee53b7595b\`\nNome: \`Kaik Batista Goncalves\`\nInstituição: **Inter**`)
      .setColor("#1e1e1e")

    message.channel.send({ content: `Envie o comprovante, ou os dados do mesmo após o pagamento.`, embeds: [embedpix] })
  }
});

// Sistema de fechar ticket
const discordTranscripts = require('discord-html-transcripts');
client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "fechar_ticket") {
      if (
        !interaction.member.permissions.has(
          PermissionFlagsBits.ManageThreads
        )
      ) {
        interaction.reply({
          content: "`` ❌ `` Você não possui permissão para utilizar este comando!",
          ephemeral: true,
        });
      } else {
        interaction.reply(
          `**${interaction.user.username}** o ticket será fechado em breve.`
        ).catch((err) => {
          return
        });

        const attachment = await discordTranscripts.createTranscript(interaction.channel, {
          fileName: `${interaction.channel.id}.html`,
        });

        const logch = client.channels.cache.get("1140069475694157934"); // Canal onde será enviado

        let logembed = new EmbedBuilder()
          .setTitle("❌ Ticket fechado!")
          .setDescription(`Ticket: \`${interaction.channel.name}\`\nID: \`${interaction.channel.id}\`\nFechado por: ${interaction.user} \`${interaction.user.id}\`\n\n> Fechado: <t:${~~(Date.now() / 1000)}:R>`)
          .setColor("Red");

        logch.send({ content: `\`💾 - Transcript ⤵\``, embeds: [logembed], files: [attachment] })
        interaction.channel.delete().catch((err) => {
          interaction.reply({ content: "Erro ao tentar fechar o ticket automaticamente!" })
          return
        });
      }
    }
  }
});

// Painel
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  // Verifica se o botão pressionado é o de criar ticket
  if (interaction.customId === "buyrobux") {

    const categoria = client.channels.cache.get("1137448430462046269")
    const logchannel = client.channels.cache.get("1140069475694157934");

    // Nome do canal 
    const channelName = `🛒┃👤${interaction.user.username}┃🆔${interaction.user.id}`;

    // Verifica se já existe um ticket aberto
    if (interaction.guild.channels.cache.find((c) => c.name === channelName)) {
      interaction.reply({
        content: `❌ Já existe um ticket aberto em ${interaction.guild.channels.cache.find(
          (c) => c.name === channelName
        )}!`,
        ephemeral: true,
      });
      return;
    }

    // Criação do canal de compra
    interaction.guild.channels
      .create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: categoria,
        permissionOverwrites: [
          { // @Everyone
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          { // @Autor do ticket
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AddReactions,
            ],
          },
          {
            id: interaction.guild.roles.cache.get("1107750393078878208"),
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.ManageChannels,
            ],
          },
        ],
      })
      .then((ch) => { // Aviso de ticket criado no canal de criação

        //ch.setParent(categoria)
        interaction.reply({
          content: `✅ Olá ${interaction.user.username}, seu ticket está criado em\n${ch}!`,
          ephemeral: true,
        });

        // Embed de boas vindas
        let embed = new EmbedBuilder()
          .setTitle("Obrigado por comprar conosco!")
          .setDescription(`Olá **${interaction.user.username}**! Agradeçemos por entrar em contato conosco. Neste momento, você pode aguardar a resposta de um staff.`)
          .setColor("#1e1e1e")
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `ID: ${interaction.user.id}` });

        // Botão para fechamento do ticket
        let botao = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("fechar_ticket")
            .setLabel("Deletar ticket!")
            .setEmoji("🔒")
            .setStyle("Danger")
        );

        // Enviar embed e marcar o cargo de atendente
        ch.send({
          embeds: [embed],
          content: `@here`,
          components: [botao],
        });

        let logembed = new EmbedBuilder()
          .setTitle("✅ Ticket aberto!")
          .setDescription(`Ticket: ${ch}\nID: \`${interaction.channel.id}\`\nAberto por: ${interaction.user} \`${interaction.user.id}\`\n\n> Aberto: <t:${~~(Date.now() / 1000)}:R>`)
          .setColor("Green");

        logchannel.send({ embeds: [logembed] })

      });
  } else if (interaction.customId === "nctrobux") {
    interaction.update({
      content: "> ``❌`` Ação cancelada!",
      embeds: [],
      components: [],
      ephemeral: true,
    });
  } else if (interaction.customId === "termos") {
    // Embed
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Ticket system | ${interaction.guild.name}`, iconURL: "https://cdn.discordapp.com/attachments/1107780433908867183/1148775297760632983/aaaaaaaaaaa.png" })
      .setDescription(`<:8263blurplemembers:1148080776957673502> Olá <@&1107747267722620968>, Abaixo está algumas informaçôes do nossos termos de compra.

•**Reserva de produtos**
- Não oferecemos opção de reserva de itens.

•**Obrigações do cliente**
- Informar dados completos e corretos no cadastro.
- Responsabilidade por erros na escrita ou transmissão dos dados.
- Respeitar ética, bons costumes e leis vigentes.
- Responsabilidade pelos produtos adquiridos por menores de idade ou pessoas sem capacidade plena.
- Não enviar avaliações ofensivas ou difamatórias.

•**Obrigações da GhostBux**
- Informar de forma clara e completa as características dos produtos.
- Enviar produtos dentro do prazo estabelecido.
- Disponibilizar uma plataforma segura.
- Disponibilizar imagens, áudios e vídeos informativos sobre os produtos.

•**Isenção de responsabilidade**
- Não nos responsabilizamos pelos produtos após a entrega.
- Todos os produtos são adquiridos de forma limpa.
- Não nos responsabilizamos após a entrega dos Robux.

•**Entrega e envio do produto**
- Produto será enviado em até 48 horas após o pagamento.
- Fechar o ticket antes do pagamento resultará na perda do valor.

•**Política de reembolso**
- Não haverá reembolso após a entrega do produto.
- Reembolso por desistência após aprovação do pagamento não será possível.
- Qualquer tentativa de reembolso por meio ilícito após a entrega do produto não será tolerada.

__:copyright: 2023 GhostBux - Todos os direitos reservados.__`)
      .setColor("#1e1e1e")

    // Enviar embed
    interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  } else if (interaction.customId === "faq") {
    // Embed
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Ticket system | ${interaction.guild.name}`, iconURL: "https://cdn.discordapp.com/attachments/1107780433908867183/1148775297760632983/aaaaaaaaaaa.png" })
      .setDescription(`<:8263blurplemembers:1148080776957673502> Olá <@&1107747267722620968>, Abaixo está algumas respostas para dúvidas frequentes.

•**Como efetuar uma compra?**
- Deseja comprar robux, ou algum outro produto de nossa loja? Navegue nos canais acima, cada canal contém informações e preços dos produtos que nós vendemos. Após ver o produto basta clicar no botão "Comprar" acima.

•**Qual a forma de pagamento?**
- Aceitamos todos os métodos de pagamento e transferência abaixo:

<:1105629568557121556:1148080796498935828>  Pagamento via pix (imediatamente) - __SEM TAXA__
> **Pix:** \`recebimentos.ghostbux@gmail.com\`

💳 Pagamento via cartão (imediatamente) - __TAXA +5%__
> **Site:** <https://link.mercadopago.com.br/ghostbux>

:newspaper: Pagamento via boleto (3 dias úteis) - __TAXA +R$3,50__
> **Site:** <https://link.mercadopago.com.br/ghostbux>

<a:773839005993140234:1148296381535105094> Pagamento via Cryptomoeda (Imediatamente) __TAXA +R$3,50__
> **ID binance:** \`OFF\`
> **Apenas:** USDT, e BTC

Abra um ticket e fale com algum staff antes de efetuar o pagamento.

•**Como recebo meu produto?**
- Se for robux, basta enviar o link da gamepass no ticket e aguardar até 7 dias úteis(Caso não saiba criar uma gamepass, iremos enviar um tutorial.). Caso for gamepass basta nos enviar seu nick no roblox, e em breve o chamaremos para efetuar o pagamento.

•**O que é taxa?**
- Sempre ao criar gamepass para comprarmos o roblox pega 30% para ele! Caso queira que cubrimos estes 30% você terá de pagar o valor com taxa.

__Caso não tenhamos respondido sua dúvida, sinta-se avontade para conversar com um de nossos__ <@&1107750393078878208> __ou__ <@&1107746448306618460>.`)
      .setColor("#1e1e1e")

    // Enviar embed
    interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
});

client.on("ready", () => {
  const activities = [
    { name: `👻 Made Ghostbux`, type: 3 },
    { name: `💻 Gerenciando ${client.channels.cache.size} Canais`, type: 3 },
    { name: `💼 Melhor bot de robux!`, type: 3 },
  ];

  let i = 0;
  setInterval(() => {
    if (i >= activities.length) i = 0;
    client.user.setActivity(activities[i]);
    i++;
  }, 10 * 500);
});

client.login(token);