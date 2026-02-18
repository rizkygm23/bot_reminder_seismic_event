// ✅ Force IPv4 first (VERY IMPORTANT - Fix EAI_AGAIN / ETIMEDOUT)
require('dns').setDefaultResultOrder('ipv4first');

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
    console.error('3. Follow instructions');
    console.error('4. Add TELEGRAM_BOT_TOKEN=your_token_here to .env');
    console.error('');
    process.exit(1);
}

// ✅ Improved polling configuration
const bot = new TelegramBot(TOKEN, {
    polling: {
        interval: 1000,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

// Set bot instance for scheduler
setBotInstance(bot);

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('     🤖 Telegram Event Reminder Bot Started!              ');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Setup scheduler
setupScheduler();

console.log('');

// =======================
// COMMAND HANDLERS
// =======================

bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.onText(/\/events/, (msg) => handleEvents(bot, msg));
bot.onText(/\/schedule/, (msg) => handleSchedule(bot, msg));
bot.onText(/\/mystatus/, (msg) => handleMyStatus(bot, msg));
bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
bot.onText(/\/test/, (msg) => handleTest(bot, msg));

// Callback query handler
bot.on('callback_query', async (query) => {
    if (query.data && query.data.startsWith('toggle_')) {
        await handleCallback(bot, query);
    }
});

// Handle unknown messages
bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
        '👋 Hi! Type /help to see available commands.',
        { parse_mode: 'Markdown' }
    );
});

// =======================
// ERROR HANDLING
// =======================

// Polling error (network issue, timeout, etc)
bot.on('polling_error', (error) => {
    console.error('❌ Polling error FULL:', error);
});

// General error
bot.on('error', (error) => {
    console.error('❌ Bot error:', error);
});

// =======================
// GRACEFUL SHUTDOWN
// =======================

process.on('SIGINT', () => {
    console.log('\n🛑 Stopping bot...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping bot...');
    bot.stopPolling();
    process.exit(0);
});

console.log('✅ Bot is running...');
console.log('📱 Find your bot on Telegram and type /start');
console.log('');
console.log('Press Ctrl+C to stop');
