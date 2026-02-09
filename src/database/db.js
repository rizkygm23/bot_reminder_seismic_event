const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Supabase credentials not found!');
    console.error('Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE_NAME = 'reminder_subscribers';

// Get subscriber data
async function getSubscriber(chatId) {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('chat_id', chatId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error getting subscriber:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error getting subscriber:', error);
        return null;
    }
}

// Add or update subscriber
async function setSubscriber(chatId, data) {
    try {
        const existing = await getSubscriber(chatId);

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from(TABLE_NAME)
                .update({
                    first_name: data.firstName || existing.first_name,
                    username: data.username || existing.username,
                    events: data.events || existing.events,
                    updated_at: new Date().toISOString()
                })
                .eq('chat_id', chatId);

            if (error) {
                console.error('Error updating subscriber:', error);
            }
        } else {
            // Insert new
            const { error } = await supabase
                .from(TABLE_NAME)
                .insert({
                    chat_id: chatId,
                    first_name: data.firstName || null,
                    username: data.username || null,
                    events: data.events || []
                });

            if (error) {
                console.error('Error inserting subscriber:', error);
            }
        }
    } catch (error) {
        console.error('Error setting subscriber:', error);
    }
}

// Get all subscribers
async function getAllSubscribers() {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*');

        if (error) {
            console.error('Error getting all subscribers:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error getting all subscribers:', error);
        return [];
    }
}

// Toggle event subscription
async function toggleEventSubscription(chatId, eventKey) {
    try {
        let subscriber = await getSubscriber(chatId);

        if (!subscriber) {
            // Create new subscriber first
            await setSubscriber(chatId, { events: [] });
            subscriber = await getSubscriber(chatId);
        }

        const events = subscriber?.events || [];
        const index = events.indexOf(eventKey);
        let isNowSubscribed;

        if (index > -1) {
            events.splice(index, 1);
            isNowSubscribed = false;
        } else {
            events.push(eventKey);
            isNowSubscribed = true;
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .update({
                events: events,
                updated_at: new Date().toISOString()
            })
            .eq('chat_id', chatId);

        if (error) {
            console.error('Error toggling subscription:', error);
            return false;
        }

        return isNowSubscribed;
    } catch (error) {
        console.error('Error toggling subscription:', error);
        return false;
    }
}

// Get subscribers for a specific event
async function getSubscribersForEvent(eventKey) {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .contains('events', [eventKey]);

        if (error) {
            console.error('Error getting subscribers for event:', error);
            return [];
        }

        return (data || []).map(row => ({
            chatId: row.chat_id,
            firstName: row.first_name,
            username: row.username,
            events: row.events
        }));
    } catch (error) {
        console.error('Error getting subscribers for event:', error);
        return [];
    }
}

module.exports = {
    supabase,
    getSubscriber,
    setSubscriber,
    getAllSubscribers,
    toggleEventSubscription,
    getSubscribersForEvent
};
