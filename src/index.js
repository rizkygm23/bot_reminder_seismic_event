require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const {
    handleStart,
    handleEvents,
    handleSchedule,
    handleCallback,
    handleMyStatus,
    handleHelp,
    handleTest
} = require('./handlers/commands');
const { setBotInstance, setupScheduler } = require('./scheduler/scheduler');

// Validate token
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN || TOKEN === 'your_telegram_bot_token_here') {
    console.error('❌ ERROR: TELEGRAM_BOT_TOKEN is invalid!');
    console.error('');
    console.error('How to get a token:');
    console.error('1. Open Telegram and search for @BotFather');
    console.error('2. Send /newbot');
    console.error('3. Follow the instructions to create a bot');
    console.error('4. Copy the token provided');
    console.error('5. Create a .env file and add:');
    console.error('   TELEGRAM_BOT_TOKEN=your_token_here');
    console.error('');
    process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Set bot instance for scheduler
setBotInstance(bot);

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('     🤖 Discord Event Reminder Bot Started!                ');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Setup scheduler
setupScheduler();

console.log('');

// Command handlers
bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.onText(/\/events/, (msg) => handleEvents(bot, msg));
bot.onText(/\/schedule/, (msg) => handleSchedule(bot, msg));
bot.onText(/\/mystatus/, (msg) => handleMyStatus(bot, msg));
bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
bot.onText(/\/test/, (msg) => handleTest(bot, msg));

// Callback query handler (for inline buttons)
bot.on('callback_query', async (query) => {
    if (query.data.startsWith('toggle_')) {
        await handleCallback(bot, query);
    }
});

// Handle unknown messages
bot.on('message', (msg) => {
    // Ignore commands
    if (msg.text && msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
        '👋 Hi! Type /help to see available commands.',
        { parse_mode: 'Markdown' }
    );
});

// Error handler
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

console.log('✅ Bot is running...');
console.log('📱 Find your bot on Telegram and type /start');
console.log('');
console.log('Press Ctrl+C to stop');
