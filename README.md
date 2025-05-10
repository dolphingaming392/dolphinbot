# Discord Bot with Review and Ticket System

A Discord bot with review system and ticket management capabilities.

## Features

- `/review` command with role-based permission checking
- Rating system through DMs with validation
- Professional review embeds posted to a designated channel
- Ticket panel system with three support categories
- Dynamic ticket channel creation and management
- Staff ticket claiming and closing functionality

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Discord credentials:
   ```
   DISCORD_TOKEN=your-discord-token-here
   CLIENT_ID=your-client-id-here
   ```
4. Start the bot:
   ```bash
   npm run dev
   ```

## Commands

- `/review` - Start the review process (requires Customer role)
- `/ping` - Check if the bot is online
- `/ticket` - Create a ticket panel in the current channel (admin only)

## Configuration

Edit the following constants in the code to match your server setup:

- `CUSTOMER_ROLE_ID` in `src/commands/review.ts` - ID of the role required to leave reviews
- `REVIEW_CHANNEL_ID` in `src/commands/review.ts` - ID of the channel where reviews are posted

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.