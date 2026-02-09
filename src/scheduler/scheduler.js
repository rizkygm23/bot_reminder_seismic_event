const cron = require('node-cron');
const { EVENTS, EVENT_SCHEDULE, PROMO_TEXT } = require('../config/events');
const { getSubscribersForEvent } = require('../database/db');

let botInstance = null;

// Set bot instance
function setBotInstance(bot) {
    botInstance = bot;
}

// Send reminder to all subscribers of a specific event
async function sendReminders(eventKey, isRegistration = false) {
    if (!botInstance) {
        console.error('Bot instance not set!');
        return;
    }

    const event = EVENTS[eventKey];
    if (!event) {
        console.error(`Event ${eventKey} not found!`);
        return;
    }

    const subscribers = await getSubscribersForEvent(eventKey);

    if (subscribers.length === 0) {
        console.log(`No subscribers for ${eventKey}`);
        return;
    }

    let message;

    if (isRegistration) {
        // Registration reminder (2 hours before)
        message = `
📝 *REGISTRATION REMINDER!*

${event.emoji} *${event.name}* registration is now open!

📅 Day: ${event.day}
🕘 Event starts at: ${event.time}
⏰ Register now! Event starts in 2 hours.
📍 Location: Discord Community

Don't forget to register! 🎯

${PROMO_TEXT}
        `.trim();
    } else {
        // Regular reminder (5 min before)
        message = `
⏰ *REMINDER!*

${event.emoji} *${event.name}* starts in *5 minutes!*

📅 Day: ${event.day}
🕘 Time: ${event.time}
📍 Location: Discord Community

Don't be late! 🚀

${PROMO_TEXT}
        `.trim();
    }

    const reminderType = isRegistration ? 'registration' : 'start';
    console.log(`Sending ${reminderType} reminders for ${eventKey} to ${subscribers.length} subscribers...`);

    for (const subscriber of subscribers) {
        try {
            await botInstance.sendMessage(subscriber.chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
            console.log(`✅ Reminder sent to ${subscriber.chatId}`);
        } catch (error) {
            console.error(`❌ Failed to send reminder to ${subscriber.chatId}:`, error.message);
        }
    }
}

// Setup cron jobs for each day's events
// All times in UTC
function setupScheduler() {

    // ========== MONDAY - Quiz ==========
    // Reminder at 13:55 UTC (5 min before 14:00 UTC)
    cron.schedule('55 13 * * 1', async () => {
        console.log(`\n[${new Date().toISOString()}] Monday Quiz reminder...`);
        await sendReminders('quiz');
    }, {
        timezone: 'UTC'
    });

    // ========== WEDNESDAY - Chess, Karaoke ==========
    // Reminder at 13:55 UTC (5 min before 14:00 UTC)
    cron.schedule('55 13 * * 3', async () => {
        console.log(`\n[${new Date().toISOString()}] Wednesday reminders...`);
        for (const eventKey of EVENT_SCHEDULE[3] || []) {
            await sendReminders(eventKey);
        }
    }, {
        timezone: 'UTC'
    });

    // ========== FRIDAY - Poker ==========
    // Registration reminder at 12:00 UTC (2 hours before)
    cron.schedule('0 12 * * 5', async () => {
        console.log(`\n[${new Date().toISOString()}] Friday Poker REGISTRATION reminder...`);
        await sendReminders('poker', true); // true = registration reminder
    }, {
        timezone: 'UTC'
    });

    // Start reminder at 13:55 UTC (5 min before 14:00 UTC)
    cron.schedule('55 13 * * 5', async () => {
        console.log(`\n[${new Date().toISOString()}] Friday Poker START reminder...`);
        await sendReminders('poker', false); // false = start reminder
    }, {
        timezone: 'UTC'
    });

    console.log('');
    console.log('✅ Scheduler setup complete!');
    console.log('');
    console.log('📅 Schedule (all times in UTC):');
    console.log('   ┌─────────────┬──────────────────────────────────────┐');
    console.log('   │ Day         │ Reminders                            │');
    console.log('   ├─────────────┼──────────────────────────────────────┤');
    console.log('   │ Monday      │ 1:55 PM UTC - Quiz                   │');
    console.log('   │ Wednesday   │ 1:55 PM UTC - Chess/Karaoke          │');
    console.log('   │ Friday      │ 12:00 PM UTC - Poker Registration    │');
    console.log('   │             │ 1:55 PM UTC - Poker Start            │');
    console.log('   └─────────────┴──────────────────────────────────────┘');
    console.log('');
    console.log('🕘 Events start at 2:00 PM UTC (9:00 PM WIB)');
}

// Manual trigger for testing
async function manualTrigger(eventKey = null, isRegistration = false) {
    if (eventKey) {
        await sendReminders(eventKey, isRegistration);
    } else {
        for (const key of Object.keys(EVENTS)) {
            await sendReminders(key, false);
        }
    }
}

module.exports = {
    setBotInstance,
    setupScheduler,
    sendReminders,
    manualTrigger
};
