const { EVENTS, PROMO_TEXT } = require('../config/events');
const {
    getSubscriber,
    setSubscriber,
    toggleEventSubscription
} = require('../database/db');

// Handle /start command
function handleStart(bot, msg) {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'User';

    // Save user info
    setSubscriber(chatId, {
        firstName,
        username: msg.from.username || null,
        createdAt: new Date().toISOString()
    });

    const welcomeMessage = `
🎉 *Welcome, ${firstName}!*

I'm the reminder bot for Discord community events.

I'll remind you *5 minutes before* events start, so you'll never be late again! ⏰

*📅 Weekly Schedule (UTC):*
• Monday 2:00 PM - Quiz
• Wednesday 2:00 PM - Chess/Karaoke
• Friday 2:00 PM - Poker
  _(Registration reminder 2 hours before)_

*Commands:*
/events - Choose events for reminders
/schedule - View weekly schedule
/mystatus - View your subscribed events
/help - Get help

Type /events to start choosing events!

${PROMO_TEXT}
    `.trim();

    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
}

// Handle /events command - Show event selection
async function handleEvents(bot, msg) {
    const chatId = msg.chat.id;
    const subscriber = await getSubscriber(chatId);
    const subscribedEvents = subscriber?.events || [];

    const keyboard = {
        inline_keyboard: Object.entries(EVENTS).map(([key, event]) => {
            const isSubscribed = subscribedEvents.includes(key);
            const status = isSubscribed ? '✅' : '⬜';
            return [{
                text: `${status} ${event.name} (${event.day})`,
                callback_data: `toggle_${key}`
            }];
        })
    };

    const message = `
📋 *Select Events for Reminders*

Click the buttons below to toggle reminders:
✅ = Reminder enabled
⬜ = Reminder disabled

*🕘 All events at 2:00 PM UTC*

🃏 Poker has 2 reminders:
• Registration (2 hours before)
• Start (5 minutes before)

${PROMO_TEXT}
    `.trim();

    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
        disable_web_page_preview: true
    });
}

// Handle /schedule command - Show weekly schedule
function handleSchedule(bot, msg) {
    const chatId = msg.chat.id;

    const message = `
📅 *Weekly Event Schedule*

*Monday:*
🧠 Quiz at 2:00 PM UTC

*Wednesday:*
♟️ Chess / 🎤 Karaoke at 2:00 PM UTC

*Friday:*
🃏 Poker at 2:00 PM UTC
  ⮡ Registration opens 12:00 PM UTC

━━━━━━━━━━━━━━━━━━

*🌍 Timezone Conversions:*
2:00 PM UTC equals:
• 9:00 PM WIB (Indonesia)
• 10:00 AM EST (New York)
• 7:00 AM PST (Los Angeles)
• 10:00 PM SGT (Singapore)
• 3:00 PM CET (Europe)
• 5:00 PM MSK (Moscow, UTC+3)

*⏰ Reminders sent:*
• 5 minutes before event
• Poker: +2 hours before for registration

Type /events to subscribe!

${PROMO_TEXT}
    `.trim();

    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
}

// Handle callback query (button clicks)
async function handleCallback(bot, query) {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data.startsWith('toggle_')) {
        const eventKey = data.replace('toggle_', '');
        const event = EVENTS[eventKey];

        if (!event) {
            bot.answerCallbackQuery(query.id, { text: 'Event not found!' });
            return;
        }

        const isNowSubscribed = await toggleEventSubscription(chatId, eventKey);

        // Answer callback
        const statusText = isNowSubscribed
            ? `✅ ${event.name} reminder enabled!`
            : `❌ ${event.name} reminder disabled!`;

        bot.answerCallbackQuery(query.id, { text: statusText });

        // Update keyboard
        const subscriber = await getSubscriber(chatId);
        const subscribedEvents = subscriber?.events || [];

        const keyboard = {
            inline_keyboard: Object.entries(EVENTS).map(([key, evt]) => {
                const isSubscribed = subscribedEvents.includes(key);
                const status = isSubscribed ? '✅' : '⬜';
                return [{
                    text: `${status} ${evt.name} (${evt.day})`,
                    callback_data: `toggle_${key}`
                }];
            })
        };

        const message = `
📋 *Select Events for Reminders*

Click the buttons below to toggle reminders:
✅ = Reminder enabled
⬜ = Reminder disabled

*🕘 All events at 2:00 PM UTC*

🃏 Poker has 2 reminders:
• Registration (2 hours before)
• Start (5 minutes before)

${PROMO_TEXT}
        `.trim();

        bot.editMessageText(message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: keyboard,
            disable_web_page_preview: true
        });
    }
}

// Handle /mystatus command
async function handleMyStatus(bot, msg) {
    const chatId = msg.chat.id;
    const subscriber = await getSubscriber(chatId);
    const subscribedEvents = subscriber?.events || [];

    let message;

    if (subscribedEvents.length === 0) {
        message = `
📊 *Your Reminder Status*

You haven't subscribed to any events yet! 😢

Type /events to select events you want to be reminded of.

${PROMO_TEXT}
        `.trim();
    } else {
        const eventList = subscribedEvents.map(key => {
            const event = EVENTS[key];
            return event ? `  • ${event.emoji} ${event.name} (${event.day})` : null;
        }).filter(Boolean).join('\n');

        const hasPoker = subscribedEvents.includes('poker');
        const pokerNote = hasPoker ? '\n\n🃏 _Poker: You\'ll get 2 reminders (registration + start)_' : '';

        message = `
📊 *Your Reminder Status*

✅ Events you'll be reminded of:
${eventList}

*⏰ Reminder Time:*
5 minutes before each event (1:55 PM UTC)${pokerNote}

Type /events to change your selection.
Type /schedule to see full weekly schedule.

${PROMO_TEXT}
        `.trim();
    }

    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
}

// Handle /help command
function handleHelp(bot, msg) {
    const chatId = msg.chat.id;

    const message = `
📚 *Reminder Bot Guide*

*Commands:*
/start - Start the bot
/events - Select events for reminders
/schedule - View weekly schedule with timezones
/mystatus - View your subscribed events
/help - Show this help message

*How it works:*
1. Type /events
2. Click the event button you want to be reminded of
3. ✅ means reminder is active
4. You'll get a notification 5 min before the event

*Weekly Schedule:*
• Monday: Quiz
• Wednesday: Chess, Karaoke
• Friday: Poker

*Event Time:*
🕘 2:00 PM UTC

*Poker Special:*
🃏 2 reminders for Poker:
• 12:00 PM UTC - Registration opens
• 1:55 PM UTC - Event starts in 5 min

*Timezone Conversions:*
2:00 PM UTC =
• 9:00 PM WIB (Indonesia)
• 10:00 AM EST (New York)
• 5:00 PM MSK (Moscow)

${PROMO_TEXT}
    `.trim();

    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
}

// Admin chat ID (private test command)
const ADMIN_CHAT_ID = 987509803;

// Handle /test command (PRIVATE - admin only)
async function handleTest(bot, msg) {
    const chatId = msg.chat.id;

    // Check if user is admin
    if (chatId !== ADMIN_CHAT_ID) {
        // Silently ignore non-admin users
        return;
    }

    await bot.sendMessage(chatId, '🧪 *Sending all test reminders...*', {
        parse_mode: 'Markdown'
    });

    // Send all event reminders
    for (const [key, event] of Object.entries(EVENTS)) {

        // If event has registration, send that FIRST (2 hours before)
        if (event.hasRegistration) {
            const regMessage = `
📝 *REGISTRATION REMINDER!*

${event.emoji} *${event.name}* registration is now open!

📅 Day: ${event.day}
🕘 Event starts at: ${event.time}
⏰ Register now! Event starts in 2 hours.
📍 Location: Discord Community

Don't forget to register! 🎯

${PROMO_TEXT}
            `.trim();

            await bot.sendMessage(chatId, regMessage, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        }

        // Then send start reminder (5 min before)
        const message = `
⏰ *REMINDER!*

${event.emoji} *${event.name}* starts in *5 minutes!*

📅 Day: ${event.day}
🕘 Time: ${event.time}
📍 Location: Discord Community

Don't be late! 🚀

${PROMO_TEXT}
        `.trim();

        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
    }

    await bot.sendMessage(chatId, '✅ *All test reminders sent!*', {
        parse_mode: 'Markdown'
    });
}

module.exports = {
    handleStart,
    handleEvents,
    handleSchedule,
    handleCallback,
    handleMyStatus,
    handleHelp,
    handleTest
};

