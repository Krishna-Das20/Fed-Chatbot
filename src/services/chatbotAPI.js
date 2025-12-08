/**
 * @fileoverview Main chatbot API orchestration service
 * @module services/chatbotAPI
 * @author FED KIIT Development Team
 * @description
 * Orchestrates the chatbot response generation by:
 * 1. Fetching team and events data
 * 2. Injecting context into AI prompts
 * 3. Generating responses via Gemini AI
 */

import { generateAIResponse, checkGeminiHealth } from './geminiAPI';
import { fetchTeamData } from './teamDataManager';
import { fetchAndCacheEvents } from './eventsDataManager';
import { ERROR_MESSAGES, LOG_PREFIX } from '../config/constants';

/**
 * Main chatbot API service
 * @namespace chatbotAPI
 */
const chatbotAPI = {
    /**
     * Send message to chatbot and get AI response with full context
     * Automatically fetches and injects team and events context
     * @async
     * @param {string} message - User's message/question
     * @param {Object} [options={}] - Optional configuration
     * @returns {Promise<Object>} Response object with success status and message
     * @example
     * const response = await chatbotAPI.sendMessage("Who is the president?");
     * if (response.success) {
     *   console.log(response.response);
     * }
     */
    sendMessage: async (message, options = {}) => {
        // Input validation
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            console.warn(`${LOG_PREFIX.CHATBOT} Empty or invalid message`);
            return {
                success: false,
                response: ERROR_MESSAGES.INVALID_INPUT,
            };
        }

        try {
            console.log(`${LOG_PREFIX.CHATBOT} Processing message: "${message.substring(0, 50)}..."`);

            // Fetch fresh data in parallel for performance
            const [teamMembers, eventsData] = await Promise.all([
                fetchTeamData().catch(error => {
                    console.error(`${LOG_PREFIX.CHATBOT} Team data fetch failed:`, error);
                    return []; // Return empty array on error
                }),
                fetchAndCacheEvents().catch(error => {
                    console.error(`${LOG_PREFIX.CHATBOT} Events data fetch failed:`, error);
                    return { upcomingEvents: [], pastEvents: [] }; // Return empty on error
                })
            ]);

            // Generate AI response with full context
            const aiResponse = await generateAIResponse(message, teamMembers, eventsData);

            console.log(`${LOG_PREFIX.CHATBOT} Response generated successfully`);

            return {
                success: true,
                response: aiResponse,
                metadata: {
                    teamMembersCount: teamMembers.length,
                    upcomingEventsCount: eventsData.upcomingEvents.length,
                    pastEventsCount: eventsData.pastEvents.length,
                    timestamp: new Date().toISOString(),
                }
            };

        } catch (error) {
            console.error(`${LOG_PREFIX.CHATBOT} Error processing message:`, error);

            return {
                success: false,
                response: ERROR_MESSAGES.NETWORK_ERROR,
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    },

    /**
     * Health check for the chatbot service
     * Tests connectivity to all required services
     * @async
     * @returns {Promise<Object>} Health status object
     * @example
     * const health = await chatbotAPI.ping();
     * console.log(health.healthy); // true/false
     */
    ping: async () => {
        console.log(`${LOG_PREFIX.CHATBOT} Running health check...`);

        const results = {
            healthy: true,
            services: {},
            timestamp: new Date().toISOString(),
        };

        try {
            // Test team data fetch
            const teamTest = await fetchTeamData()
                .then(() => ({ status: 'ok', count: 'available' }))
                .catch(error => ({ status: 'error', message: error.message }));

            results.services.team = teamTest;

            // Test events data fetch
            const eventsTest = await fetchAndCacheEvents()
                .then(data => ({
                    status: 'ok',
                    upcoming: data.upcomingEvents.length,
                    past: data.pastEvents.length
                }))
                .catch(error => ({ status: 'error', message: error.message }));

            results.services.events = eventsTest;

            // Test Gemini AI
            const geminiTest = await checkGeminiHealth()
                .then(ok => ({ status: ok ? 'ok' : 'error' }))
                .catch(error => ({ status: 'error', message: error.message }));

            results.services.gemini = geminiTest;

            // Overall health status
            results.healthy =
                teamTest.status === 'ok' &&
                eventsTest.status === 'ok' &&
                geminiTest.status === 'ok';

            console.log(`${LOG_PREFIX.CHATBOT} Health check complete:`, results.healthy ? 'PASS' : 'FAIL');

            return results;

        } catch (error) {
            console.error(`${LOG_PREFIX.CHATBOT} Health check failed:`, error);

            return {
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    },

    /**
     * Get chatbot statistics
     * @async
     * @returns {Promise<Object>} Statistics object
     */
    getStats: async () => {
        try {
            const [teamData, eventsData] = await Promise.all([
                fetchTeamData(),
                fetchAndCacheEvents(),
            ]);

            return {
                team: {
                    totalMembers: teamData.length,
                },
                events: {
                    upcomingCount: eventsData.upcomingEvents.length,
                    pastCount: eventsData.pastEvents.length,
                },
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error(`${LOG_PREFIX.CHATBOT} Error getting stats:`, error);
            return {
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
};

export default chatbotAPI;
