import { ButtonInteraction } from 'discord.js';
import { handleTicketButtons } from '../systems/ticketSystem.js';

export async function handleButtons(interaction: ButtonInteraction) {
  try {
    const buttonId = interaction.customId;
    
    // Handle ticket buttons
    if (buttonId.startsWith('ticket_')) {
      await handleTicketButtons(interaction);
      return;
    }
    
    // Handle claim button
    if (buttonId === 'claim_ticket') {
      await handleClaimTicket(interaction);
      return;
    }
    
    // Handle close button
    if (buttonId === 'close_ticket') {
      await handleCloseTicket(interaction);
      return;
    }
    
    // Handle transcript button
    if (buttonId === 'transcript_ticket') {
      await handleTicketTranscript(interaction);
      return;
    }
    
    // Unknown button
    await interaction.reply({
      content: '❌ Unknown button interaction.',
      ephemeral: true
    });
    
  } catch (error) {
    console.error('Error handling button:', error);
    
    // Reply with error
    await interaction.reply({
      content: '❌ An error occurred while processing your request.',
      ephemeral: true
    });
  }
}

async function handleClaimTicket(interaction: ButtonInteraction) {
  try {
    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) return;
    
    await interaction.reply({
      content: `✅ Ticket claimed by ${interaction.user}`,
    });
    
    // Update channel topic to show who claimed it
    if ('setTopic' in channel) {
      await channel.setTopic(`Claimed by: ${interaction.user.tag}`);
    }
  } catch (error) {
    console.error('Error claiming ticket:', error);
    await interaction.reply({ content: '❌ Failed to claim ticket.', ephemeral: true });
  }
}

async function handleCloseTicket(interaction: ButtonInteraction) {
  try {
    const channel = interaction.channel;
    if (!channel || !('delete' in channel)) return;
    
    await interaction.reply({ content: '🔒 Closing ticket in 5 seconds...' });
    
    // Close the ticket after 5 seconds
    setTimeout(async () => {
      try {
        await channel.delete('Ticket closed');
      } catch (error) {
        console.error('Error deleting ticket channel:', error);
      }
    }, 5000);
  } catch (error) {
    console.error('Error closing ticket:', error);
    await interaction.reply({ content: '❌ Failed to close ticket.', ephemeral: true });
  }
}

async function handleTicketTranscript(interaction: ButtonInteraction) {
  // In a real implementation, this would save the transcript
  await interaction.reply({
    content: '📝 Ticket transcript feature will be implemented in a future update.',
    ephemeral: true
  });
}