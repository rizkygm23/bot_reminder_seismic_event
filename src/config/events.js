// List of available events with schedule
// All events start at 9:00 PM WIB (UTC+7) = 2:00 PM UTC

const EVENTS = {
    quiz: {
        name: '🧠 Quiz',
        emoji: '🧠',
        day: 'Monday',
        frequency: 'Every week',
        time: '2:00 PM UTC',
        timeLocal: '9:00 PM WIB',
        description: 'Weekly quiz event on Discord'
    },
    chess_karaoke: {
        name: '♟️ Chess / 🎤 Karaoke',
        emoji: '♟️🎤',
        day: 'Wednesday',
        frequency: 'Every week',
        time: '2:00 PM UTC',
        timeLocal: '9:00 PM WIB',
        description: 'Weekly chess or karaoke on Discord'
    },
    poker: {
        name: '🃏 Poker',
        emoji: '🃏',
        day: 'Friday',
        frequency: 'Every week',
        time: '2:00 PM UTC',
        timeLocal: '9:00 PM WIB',
        description: 'Weekly poker game on Discord',
        hasRegistration: true,
        registrationTime: '12:00 PM UTC', // 2 hours before
        registrationTimeLocal: '7:00 PM WIB'
    }
};

// Event schedule by day (for scheduler)
// 0 = Sunday, 1 = Monday, ..., 5 = Friday
const EVENT_SCHEDULE = {
    1: ['quiz'],              // Monday
    3: ['chess_karaoke'],     // Wednesday  
    5: ['poker']              // Friday
};

// Timezone info
const TIMEZONE_INFO = {
    eventTimeUTC: '14:00',    // 2:00 PM UTC
    reminderTimeUTC: '13:55', // 1:55 PM UTC (5 min before)
    pokerRegTimeUTC: '12:00'  // 12:00 PM UTC (2 hours before)
};

// Promotion/credit link
const PROMO_LINK = '[rizzgm](https://x.com/RizzDroop23)';
const PROMO_TEXT = '_Made by_ [rizzgm](https://x.com/RizzDroop23)';

module.exports = { EVENTS, EVENT_SCHEDULE, TIMEZONE_INFO, PROMO_LINK, PROMO_TEXT };
