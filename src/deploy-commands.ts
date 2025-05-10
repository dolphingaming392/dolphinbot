import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

// Command definitions
const commands = [
  new SlashCommandBuilder()
    .setName('review')
    .setDescription('Leave a review for our services')
    .setDMPermission(false)
    .toJSON(),
  
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the bot is online')
    .setDMPermission(true)
    .toJSON(),
    
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Creates a ticket panel in the current channel')
    .setDefaultMemberPermissions(0) // Only admins can use this command
    .setDMPermission(false)
    .toJSON(),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands and their usage')
    .setDMPermission(true)
    .toJSON(),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display server statistics')
    .setDMPermission(false)
    .toJSON(),

  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages in a channel')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to clear (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .toJSON(),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option => 
      option
        .setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the ban')
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .toJSON(),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the kick')
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .toJSON(),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to mute')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Mute duration in minutes')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .toJSON(),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .toJSON(),

  new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to modify roles for')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to add/remove')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('add')
        .setDescription('True to add the role, false to remove it')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .toJSON(),
];

export async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  
  if (!token || !clientId) {
    console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in environment variables');
    return;
  }
  
  const rest = new REST({ version: '10' }).setToken(token);
  
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);
    
    // Register commands globally
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );
    
    console.log('✅ Successfully registered application commands.');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}