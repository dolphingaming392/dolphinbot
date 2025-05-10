import {
  ButtonInteraction,
  GuildMember,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Colors
} from 'discord.js';

export async function handleTicketButtons(interaction: ButtonInteraction) {
  try {
    const buttonId = interaction.customId;
    const user = interaction.user;
    const guild = interaction.guild;
    
    if (!guild) {
      await interaction.reply({
        content: '❌ This command can only be used in a server.',
        ephemeral: true
      });
      return;
    }
    
    // Extract ticket type from button ID
    const ticketType = buttonId.split('_')[1]; // ticket_order -> order
    
    // Validate ticket type
    if (!['order', 'question', 'support'].includes(ticketType)) {
      await interaction.reply({
        content: '❌ Invalid ticket type.',
        ephemeral: true
      });
      return;
    }
    
    // Check if user already has an open ticket
    const existingTicket = guild.channels.cache.find(
      channel => channel.name === `${ticketType}-${user.username.toLowerCase()}`
    );
    
    if (existingTicket) {
      await interaction.reply({
        content: `❌ You already have an open ${ticketType} ticket: <#${existingTicket.id}>`,
        ephemeral: true
      });
      return;
    }
    
    // Create ticket channel
    await createTicketChannel(interaction, ticketType);
  } catch (error) {
    console.error('Error handling ticket button:', error);
    
    await interaction.reply({
      content: '❌ An error occurred while creating your ticket.',
      ephemeral: true
    });
  }
}

async function createTicketChannel(interaction: ButtonInteraction, ticketType: string) {
  try {
    const guild = interaction.guild;
    const user = interaction.user;
    
    if (!guild) return;
    
    // Notify user that ticket is being created
    await interaction.reply({
      content: '🎟️ Creating your ticket...',
      ephemeral: true
    });
    
    // Get or create parent category for tickets
    let category = guild.channels.cache.find(
      channel => channel.type === ChannelType.GuildCategory && channel.name === 'Tickets'
    );
    
    if (!category) {
      category = await guild.channels.create({
        name: 'Tickets',
        type: ChannelType.GuildCategory,
      });
    }
    
    // Create permission overwrites
    const permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ];
    
    // Add admin/staff role to permissions if available
    const staffRole = guild.roles.cache.find(role => 
      role.name.toLowerCase().includes('staff') || 
      role.name.toLowerCase().includes('admin')
    );
    
    if (staffRole) {
      permissionOverwrites.push({
        id: staffRole.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
        ],
      });
    }
    
    // Create the ticket channel
    const channel = await guild.channels.create({
      name: `${ticketType}-${user.username.toLowerCase()}`,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites,
    });
    
    // Create staff action buttons
    const staffButtons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('Claim Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔒'),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌'),
        new ButtonBuilder()
          .setCustomId('transcript_ticket')
          .setLabel('Save Transcript')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📝')
      );
    
    // Create welcome message embed
    const welcomeEmbed = new EmbedBuilder()
      .setTitle(`🎟️ ${capitalizeFirstLetter(ticketType)} Ticket`)
      .setDescription(`👋 Hello ${user}! Please describe your request. A staff member will be with you shortly.`)
      .setColor(getTicketColor(ticketType))
      .addFields({ name: 'Ticket Type', value: capitalizeFirstLetter(ticketType), inline: true })
      .setFooter({ text: `Ticket opened by ${user.tag}` })
      .setTimestamp();
    
    // Send welcome message
    await channel.send({
      content: `${user}`,
      embeds: [welcomeEmbed],
      components: [staffButtons]
    });
    
    // Update the ephemeral reply
    await interaction.editReply({
      content: `✅ Your ticket has been created: <#${channel.id}>`
    });
  } catch (error) {
    console.error('Error creating ticket channel:', error);
    
    // Update the ephemeral reply with error
    await interaction.editReply({
      content: '❌ Failed to create ticket channel. Please try again later.'
    });
  }
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getTicketColor(ticketType: string): Colors {
  switch (ticketType) {
    case 'order':
      return Colors.Purple;
    case 'question':
      return Colors.Blue;
    case 'support':
      return Colors.Green;
    default:
      return Colors.Blurple;
  }
}