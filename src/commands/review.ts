import { 
  CommandInteraction, 
  GuildMember, 
  EmbedBuilder, 
  TextChannel,
  Colors,
  DMChannel,
  Message
} from 'discord.js';
import { client } from '../index.js';
import { hasRole } from '../utils/permissions.js';

// Constants
const CUSTOMER_ROLE_ID = '1370569793475842093';
const REVIEW_CHANNEL_ID = '1370569794172223594';

// Interface for review data
interface ReviewData {
  overall: number;
  speed: number;
  quality: number;
  valueForMoney: number;
  description: string;
}

export async function handleReviewCommand(interaction: CommandInteraction) {
  try {
    // 1. Check if user has required role
    const member = interaction.member as GuildMember;
    
    if (!hasRole(member, CUSTOMER_ROLE_ID)) {
      await interaction.reply({
        content: '❌ You must have the required role to leave a review.',
        ephemeral: true
      });
      return;
    }
    
    // 2. Notify user that process will continue in DMs
    await interaction.reply({
      content: '📬 This process will continue in your DMs. Please ensure your DMs are open!',
      ephemeral: true
    });
    
    // 3. Start the DM flow
    try {
      await startReviewDMFlow(interaction);
    } catch (error) {
      console.error('Error in DM flow:', error);
      
      // Notify user of error if DMs couldn't be sent
      await interaction.followUp({
        content: '❌ I couldn\'t send you a DM. Please check your privacy settings and ensure you allow DMs from server members.',
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling review command:', error);
    
    if (!interaction.replied) {
      await interaction.reply({
        content: '❌ An error occurred while processing your review.',
        ephemeral: true
      });
    }
  }
}

async function startReviewDMFlow(interaction: CommandInteraction) {
  const user = interaction.user;
  const dm = await user.createDM();
  
  // Step 1: Ask for star ratings
  const ratingsMessage = await dm.send({
    content: 'Please rate your experience using the following format (1-5 stars for each):\n\n' +
             'Overall:  \n' +
             'Speed:  \n' +
             'Quality:  \n' +
             'Value for Money:'
  });
  
  // Wait for rating response
  const ratingResponse = await waitForDMResponse(dm, user.id);
  if (!ratingResponse) return;
  
  // Parse and validate ratings
  const ratings = parseRatings(ratingResponse.content);
  if (!ratings) {
    await dm.send('❌ Invalid rating format. Please use the `/review` command again and follow the format provided.');
    return;
  }
  
  // Step 2: Ask for description
  await dm.send('Thank you! Now please provide a short description of your experience with our service.');
  
  // Wait for description response
  const descriptionResponse = await waitForDMResponse(dm, user.id);
  if (!descriptionResponse) return;
  
  // Add description to review data
  const reviewData: ReviewData = {
    ...ratings,
    description: descriptionResponse.content.trim()
  };
  
  // Post the review in the designated channel
  await postReview(interaction, reviewData);
  
  // Thank the user
  await dm.send('✅ Thank you for your review! It has been posted in our reviews channel.');
}

function parseRatings(content: string): { overall: number; speed: number; quality: number; valueForMoney: number } | null {
  try {
    // Extract ratings using regex
    const overallMatch = content.match(/Overall:\s*([1-5])/i);
    const speedMatch = content.match(/Speed:\s*([1-5])/i);
    const qualityMatch = content.match(/Quality:\s*([1-5])/i);
    const valueMatch = content.match(/Value for Money:\s*([1-5])/i);
    
    // Check if all ratings were found
    if (!overallMatch || !speedMatch || !qualityMatch || !valueMatch) {
      return null;
    }
    
    // Parse ratings to numbers
    const overall = parseInt(overallMatch[1]);
    const speed = parseInt(speedMatch[1]);
    const quality = parseInt(qualityMatch[1]);
    const valueForMoney = parseInt(valueMatch[1]);
    
    // Validate all ratings are between 1-5
    if (
      isNaN(overall) || overall < 1 || overall > 5 ||
      isNaN(speed) || speed < 1 || speed > 5 ||
      isNaN(quality) || quality < 1 || quality > 5 ||
      isNaN(valueForMoney) || valueForMoney < 1 || valueForMoney > 5
    ) {
      return null;
    }
    
    return { overall, speed, quality, valueForMoney };
  } catch (error) {
    console.error('Error parsing ratings:', error);
    return null;
  }
}

async function waitForDMResponse(dmChannel: DMChannel, userId: string, timeout = 300000): Promise<Message | null> {
  try {
    // Wait for message in DM channel from the specific user
    const collected = await dmChannel.awaitMessages({
      filter: (m) => m.author.id === userId,
      max: 1,
      time: timeout,
      errors: ['time']
    });
    
    return collected.first() || null;
  } catch (error) {
    // Timeout or error
    await dmChannel.send('❌ Review process timed out or encountered an error. Please use the `/review` command again to restart.');
    return null;
  }
}

async function postReview(interaction: CommandInteraction, reviewData: ReviewData) {
  try {
    // Get the review channel
    const guild = interaction.guild;
    if (!guild) return;
    
    const reviewChannel = guild.channels.cache.get(REVIEW_CHANNEL_ID) as TextChannel;
    if (!reviewChannel) {
      console.error('Review channel not found');
      return;
    }
    
    // Create the review embed
    const embed = new EmbedBuilder()
      .setTitle('🌟 New Customer Review')
      .setColor(Colors.Blue)
      .addFields(
        { name: 'Overall', value: getStarRating(reviewData.overall), inline: true },
        { name: 'Speed', value: getStarRating(reviewData.speed), inline: true },
        { name: 'Quality', value: getStarRating(reviewData.quality), inline: true },
        { name: 'Value for Money', value: getStarRating(reviewData.valueForMoney), inline: true },
        { name: 'Description', value: reviewData.description }
      )
      .setFooter({
        text: `Review by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    // Post the review
    await reviewChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error posting review:', error);
  }
}

function getStarRating(rating: number): string {
  const fullStars = '⭐'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return fullStars + emptyStars;
}