import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';
import * as dotenv from 'dotenv';
import { handleCommands } from './handlers/commandHandler.js';
import { handleButtons } from './handlers/buttonHandler.js';
import { registerCommands } from './deploy-commands.js';

// Load environment variables
dotenv.config();

// Create client with required intents and partials
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

// Bot is ready
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`🚀 Bot is ready! Logged in as ${readyClient.user.tag}`);
  
  // Register slash commands when bot starts
  try {
    await registerCommands();
    console.log('✅ Successfully registered application commands');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
});

// Handle commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    await handleCommands(interaction);
  } else if (interaction.isButton()) {
    await handleButtons(interaction);
  }
});

// Log in to Discord with your token
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log('✅ Logged in successfully');
  })
  .catch((error) => {
    console.error('❌ Error logging in:', error);
  });

// Handle process termination
process.on('SIGINT', () => {
  console.log('Bot is shutting down...');
  client.destroy();
  process.exit(0);
});

export { client };