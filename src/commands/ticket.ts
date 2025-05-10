import {
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Colors,
  TextChannel
} from 'discord.js';

export async function handleTicketCommand(interaction: CommandInteraction) {
  try {
    // Check if command was used in a text channel
    if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
      await interaction.reply({
        content: '❌ This command can only be used in a text channel.',
        ephemeral: true
      });
      return;
    }
    
    // Create ticket panel embed
    const embed = new EmbedBuilder()
      .setTitle('🎟️ Support Ticket System')
      .setDescription('Need help? Open a ticket below:')
      .setColor(Colors.Blue)
      .addFields(
        { name: '🎨 Order', value: 'Open a ticket to place an order', inline: true },
        { name: '❓ Questions', value: 'Have questions about our services', inline: true },
        { name: '🛠️ Support', value: 'Get technical support for issues', inline: true }
      )
      .setFooter({ text: 'Click a button below to create a ticket' })
      .setTimestamp();
    
    // Create buttons for ticket options
    const buttons = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_order')
          .setLabel('🎨 Order')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('ticket_question')
          .setLabel('❓ Questions')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('ticket_support')
          .setLabel('🛠️ Support')
          .setStyle(ButtonStyle.Success)
      );
    
    // Send the ticket panel
    await interaction.channel.send({
      embeds: [embed],
      components: [buttons]
    });
    
    // Reply to the command
    await interaction.reply({
      content: '✅ Ticket panel created successfully!',
      ephemeral: true
    });
  } catch (error) {
    console.error('Error creating ticket panel:', error);
    
    await interaction.reply({
      content: '❌ An error occurred while creating the ticket panel.',
      ephemeral: true
    });
  }
}