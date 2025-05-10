import { CommandInteraction, EmbedBuilder, Colors, TextChannel, GuildMember } from 'discord.js';
import { handleReviewCommand } from '../commands/review.js';
import { handleTicketCommand } from '../commands/ticket.js';

export async function handleCommands(interaction: CommandInteraction) {
  try {
    const commandName = interaction.commandName;
    
    switch (commandName) {
      case 'review':
        await handleReviewCommand(interaction);
        break;
      case 'ticket':
        await handleTicketCommand(interaction);
        break;
      case 'ping':
        await interaction.reply({ content: '🏓 Pong! Bot is online.', ephemeral: true });
        break;
      case 'help':
        await handleHelpCommand(interaction);
        break;
      case 'stats':
        await handleStatsCommand(interaction);
        break;
      case 'clear':
        await handleClearCommand(interaction);
        break;
      case 'ban':
        await handleBanCommand(interaction);
        break;
      case 'kick':
        await handleKickCommand(interaction);
        break;
      case 'mute':
        await handleMuteCommand(interaction);
        break;
      case 'warn':
        await handleWarnCommand(interaction);
        break;
      case 'role':
        await handleRoleCommand(interaction);
        break;
      default:
        await interaction.reply({
          content: '❌ Unknown command.',
          ephemeral: true
        });
    }
  } catch (error) {
    console.error('Error handling command:', error);
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '❌ An error occurred while processing your command.',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: '❌ An error occurred while processing your command.',
        ephemeral: true
      });
    }
  }
}

async function handleHelpCommand(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle('📚 Available Commands')
    .setColor(Colors.Blue)
    .addFields(
      { name: '/review', value: 'Leave a review for our services (requires Customer role)' },
      { name: '/ticket', value: 'Creates a ticket panel in the current channel (admin only)' },
      { name: '/ping', value: 'Check if the bot is online' },
      { name: '/stats', value: 'Display server statistics' },
      { name: '/clear', value: 'Clear messages in a channel (admin only)' },
      { name: '/ban', value: 'Ban a user from the server (admin only)' },
      { name: '/kick', value: 'Kick a user from the server (admin only)' },
      { name: '/mute', value: 'Mute a user (admin only)' },
      { name: '/warn', value: 'Warn a user (admin only)' },
      { name: '/role', value: 'Add or remove a role from a user (admin only)' },
      { name: '/help', value: 'Shows this help message' }
    )
    .setFooter({ text: 'For more details about a command, use it with no arguments' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleStatsCommand(interaction: CommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const totalMembers = guild.memberCount;
  const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
  const totalChannels = guild.channels.cache.size;
  const totalRoles = guild.roles.cache.size;

  const embed = new EmbedBuilder()
    .setTitle('📊 Server Statistics')
    .setColor(Colors.Green)
    .addFields(
      { name: 'Total Members', value: totalMembers.toString(), inline: true },
      { name: 'Online Members', value: onlineMembers.toString(), inline: true },
      { name: 'Total Channels', value: totalChannels.toString(), inline: true },
      { name: 'Total Roles', value: totalRoles.toString(), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleClearCommand(interaction: CommandInteraction) {
  const amount = interaction.options.get('amount')?.value as number;
  
  if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
    await interaction.reply({
      content: '❌ This command can only be used in text channels.',
      ephemeral: true
    });
    return;
  }

  try {
    const messages = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({
      content: `✅ Successfully deleted ${messages.size} messages.`,
      ephemeral: true
    });
  } catch (error) {
    await interaction.reply({
      content: '❌ Failed to delete messages. Messages older than 14 days cannot be bulk deleted.',
      ephemeral: true
    });
  }
}

async function handleBanCommand(interaction: CommandInteraction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const guild = interaction.guild;

  if (!guild || !user) {
    await interaction.reply({ content: '❌ Invalid command usage.', ephemeral: true });
    return;
  }

  try {
    await guild.members.ban(user, { reason });
    await interaction.reply({
      content: `✅ Successfully banned ${user.tag}\nReason: ${reason}`,
      ephemeral: true
    });
  } catch (error) {
    await interaction.reply({
      content: '❌ Failed to ban user. Make sure I have the required permissions.',
      ephemeral: true
    });
  }
}

async function handleKickCommand(interaction: CommandInteraction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason') || 'No reason provided';
  const guild = interaction.guild;

  if (!guild || !user) {
    await interaction.reply({ content: '❌ Invalid command usage.', ephemeral: true });
    return;
  }

  const member = await guild.members.fetch(user.id);
  
  try {
    await member.kick(reason);
    await interaction.reply({
      content: `✅ Successfully kicked ${user.tag}\nReason: ${reason}`,
      ephemeral: true
    });
  } catch (error) {
    await interaction.reply({
      content: '❌ Failed to kick user. Make sure I have the required permissions.',
      ephemeral: true
    });
  }
}

async function handleMuteCommand(interaction: CommandInteraction) {
  const user = interaction.options.getUser('user');
  const duration = interaction.options.getInteger('duration', true);
  const guild = interaction.guild;

  if (!guild || !user) {
    await interaction.reply({ content: '❌ Invalid command usage.', ephemeral: true });
    return;
  }

  const member = await guild.members.fetch(user.id);
  const muteRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');

  if (!muteRole) {
    await interaction.reply({
      content: '❌ Muted role not found. Please create a role named "Muted".',
      ephemeral: true
    });
    return;
  }

  try {
    await member.roles.add(muteRole);
    await interaction.reply({
      content: `✅ Muted ${user.tag} for ${duration} minutes.`,
      ephemeral: true
    });

    // Unmute after duration
    setTimeout(async () => {
      try {
        await member.roles.remove(muteRole);
        await interaction.followUp({
          content: `✅ ${user.tag} has been automatically unmuted.`,
          ephemeral: true
        });
      } catch (error) {
        console.error('Error unmuting user:', error);
      }
    }, duration * 60 * 1000);
  } catch (error) {
    await interaction.reply({
      content: '❌ Failed to mute user. Make sure I have the required permissions.',
      ephemeral: true
    });
  }
}

async function handleWarnCommand(interaction: CommandInteraction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason', true);
  
  if (!user) {
    await interaction.reply({ content: '❌ Invalid command usage.', ephemeral: true });
    return;
  }

  try {
    // Send warning to user
    await user.send(`⚠️ You have been warned in ${interaction.guild?.name}\nReason: ${reason}`);
    
    await interaction.reply({
      content: `✅ Successfully warned ${user.tag}\nReason: ${reason}`,
      ephemeral: true
    });
  } catch (error) {
    await interaction.reply({
      content: '❌ Failed to warn user. They might have DMs disabled.',
      ephemeral: true
    });
  }
}

async function handleRoleCommand(interaction: CommandInteraction) {
  const user = interaction.options.getUser('user');
  const role = interaction.options.getRole('role');
  const add = interaction.options.getBoolean('add', true);
  const guild = interaction.guild;

  if (!guild || !user || !role) {
    await interaction.reply({ content: '❌ Invalid command usage.', ephemeral: true });
    return;
  }

  const member = await guild.members.fetch(user.id);

  try {
    if (add) {
      await member.roles.add(role);
      await interaction.reply({
        content: `✅ Added role ${role.name} to ${user.tag}`,
        ephemeral: true
      });
    } else {
      await member.roles.remove(role);
      await interaction.reply({
        content: `✅ Removed role ${role.name} from ${user.tag}`,
        ephemeral: true
      });
    }
  } catch (error) {
    await interaction.reply({
      content: '❌ Failed to modify roles. Make sure I have the required permissions.',
      ephemeral: true
    });
  }
}