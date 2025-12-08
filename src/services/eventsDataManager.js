/**
 * @fileoverview Events data management service with intelligent caching
 * @module services/eventsDataManager
 * @author FED KIIT Development Team
 * @requires axios
 * @requires config/constants
 */

import axios from 'axios';
import { CONFIG, HTTP_STATUS, SUCCESS_MESSAGES, LOG_PREFIX } from '../config/constants';

/**
 * Cache state for events data
 * @private
 */
let cachedEvents = {
    upcomingEvents: [],
    pastEvents: []
};

let lastEventsFetchTime = 0;

/**
 * Checks if cached data is still fresh
 * @private
 * @returns {boolean} True if cache is valid
 */
const isCacheFresh = () => {
    const now = Date.now();
    const cacheAge = now - lastEventsFetchTime;
    return cacheAge < CONFIG.CACHE.EVENTS_DURATION && cachedEvents.upcomingEvents.length > 0;
};

/**
 * Fetch data with exponential backoff retry
 * @private
 * @param {string} url - URL to fetch from
 * @param {number} [maxRetries=3] - Maximum retry attempts
 * @returns {Promise<Object>} Axios response object
 * @throws {Error} If all retry attempts fail
 */
const fetchWithBackoff = async (url, maxRetries = CONFIG.RETRY.MAX_ATTEMPTS) => {
    let delay = CONFIG.RETRY.INITIAL_DELAY;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.get(url, {
                timeout: 10000, // 10 second timeout
            });

            if (response.status === HTTP_STATUS.OK) {
                return response;
            }
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                console.warn(`${LOG_PREFIX.EVENTS} Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
    }

    throw new Error(`Failed to fetch events after ${maxRetries} attempts: ${lastError.message}`);
};

/**
 * Filters and processes raw events data
 * @private
 * @param {Array} rawEvents - Raw events array from API
 * @returns {Object} Processed events with upcoming and past separated
 */
const processEventsData = (rawEvents) => {
    if (!Array.isArray(rawEvents)) {
        console.error(`${LOG_PREFIX.EVENTS} Invalid events data format`);
        return { upcomingEvents: [], pastEvents: [] };
    }

    // Filter upcoming events (not past) - matches index(1).html line 204
    const upcomingEvents = rawEvents.filter(
        event => event?.info && !event.info.isEventPast
    );

    // Get past events, sorted by date (most recent first)
    const pastEvents = rawEvents
        .filter(event => event?.info && event.info.isEventPast)
        .sort((a, b) => {
            const dateA = new Date(a.info.eventDate);
            const dateB = new Date(b.info.eventDate);
            return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5) // Keep only last 5 past events
        .map(event => event.info); // Extract only info object

    return { upcomingEvents, pastEvents };
};

/**
 * Fetch and cache events data from API
 * Implements intelligent caching to reduce API calls
 * @async
 * @returns {Promise<Object>} Events data with upcomingEvents and pastEvents arrays
 * @throws {Error} If fetch fails and no cached data available
 * @example
 * const events = await fetchAndCacheEvents();
 * console.log(events.upcomingEvents); // Array of upcoming events
 * console.log(events.pastEvents); // Array of past 5 events
 */
export const fetchAndCacheEvents = async () => {
    // Return cached data if fresh
    if (isCacheFresh()) {
        console.log(`${LOG_PREFIX.EVENTS} ${SUCCESS_MESSAGES.CACHE_HIT}`);
        return cachedEvents;
    }

    console.log(`${LOG_PREFIX.EVENTS} Fetching fresh data from API...`);

    try {
        const url = `${CONFIG.API.BASE_URL}${CONFIG.API.EVENTS_ENDPOINT}`;
        const response = await fetchWithBackoff(url);

        if (response.data?.success && Array.isArray(response.data.events)) {
            const processedEvents = processEventsData(response.data.events);

            // Update cache
            cachedEvents = processedEvents;
            lastEventsFetchTime = Date.now();

            const { upcomingEvents, pastEvents } = processedEvents;
            console.log(
                `${LOG_PREFIX.EVENTS} ${SUCCESS_MESSAGES.CACHE_UPDATED}:`,
                `${upcomingEvents.length} upcoming, ${pastEvents.length} past`
            );

            return cachedEvents;
        } else {
            throw new Error('Invalid response format from events API');
        }

    } catch (error) {
        console.error(`${LOG_PREFIX.EVENTS} Error fetching events:`, error.message);

        // Return stale cache if available, otherwise empty data
        if (cachedEvents.upcomingEvents.length > 0 || cachedEvents.pastEvents.length > 0) {
            console.warn(`${LOG_PREFIX.EVENTS} Using stale cached data due to fetch error`);
            return cachedEvents;
        }

        return { upcomingEvents: [], pastEvents: [] };
    }
};

/**
 * Get only upcoming events
 * @async
 * @returns {Promise<Array>} Array of upcoming events
 */
export const getUpcomingEvents = async () => {
    const events = await fetchAndCacheEvents();
    return events.upcomingEvents;
};

/**
 * Get only past events
 * @async
 * @returns {Promise<Array>} Array of past events (max 5)
 */
export const getPastEvents = async () => {
    const events = await fetchAndCacheEvents();
    return events.pastEvents;
};

/**
 * Search events by title or description
 * @async
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching events
 */
export const searchEvents = async (query) => {
    if (typeof query !== 'string' || query.trim().length === 0) {
        console.warn(`${LOG_PREFIX.EVENTS} Invalid search query`);
        return [];
    }

    const events = await fetchAndCacheEvents();
    const allEvents = [...events.upcomingEvents, ...events.pastEvents];

    const lowerQuery = query.toLowerCase();

    return allEvents.filter(event => {
        const title = event.info?.eventTitle?.toLowerCase() || '';
        const description = event.info?.eventdescription?.toLowerCase() || '';
        return title.includes(lowerQuery) || description.includes(lowerQuery);
    });
};

/**
 * Get event by ID
 * @async
 * @param {string} eventId - Event ID to search for
 * @returns {Promise<Object|null>} Event object or null if not found
 */
export const getEventById = async (eventId) => {
    if (!eventId) {
        console.warn(`${LOG_PREFIX.EVENTS} No event ID provided`);
        return null;
    }

    const events = await fetchAndCacheEvents();
    const allEvents = [...events.upcomingEvents, ...events.pastEvents];

    return allEvents.find(event => event.id === eventId) || null;
};

/**
 * Clear events cache (force refresh on next fetch)
 * @returns {void}
 */
export const clearEventsCache = () => {
    cachedEvents = { upcomingEvents: [], pastEvents: [] };
    lastEventsFetchTime = 0;
    console.log(`${LOG_PREFIX.EVENTS} Cache cleared`);
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
    const cacheAge = Date.now() - lastEventsFetchTime;

    return {
        upcomingCount: cachedEvents.upcomingEvents.length,
        pastCount: cachedEvents.pastEvents.length,
        lastFetchTime: lastEventsFetchTime,
        cacheAge: cacheAge,
        cacheDuration: CONFIG.CACHE.EVENTS_DURATION,
        isFresh: isCacheFresh(),
    };
};

export default {
    fetchAndCacheEvents,
    getUpcomingEvents,
    getPastEvents,
    searchEvents,
    getEventById,
    clearEventsCache,
    getCacheStats,
};
