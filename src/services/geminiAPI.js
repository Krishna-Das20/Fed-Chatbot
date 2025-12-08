/**
 * @fileoverview Gemini AI API integration service
 * @module services/geminiAPI
 * @author FED KIIT Development Team
 * @requires axios
 * @requires config/constants
 */

import axios from 'axios';
import { CONFIG, HTTP_STATUS, ERROR_MESSAGES, LOG_PREFIX } from '../config/constants';

/**
 * Exponential backoff retry wrapper for async functions
 * @private
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise<any>} Result of the function call
 * @throws {Error} If all retry attempts fail
 */
const retryWithBackoff = async (fn, maxRetries = CONFIG.RETRY.MAX_ATTEMPTS, initialDelay = CONFIG.RETRY.INITIAL_DELAY) => {
    let delay = initialDelay;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries) {
                console.error(`${LOG_PREFIX.GEMINI} All ${maxRetries} retry attempts failed:`, error);
                throw error;
            }

            console.warn(`${LOG_PREFIX.GEMINI} Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }

    throw lastError;
};

/**
 * Builds the Gemini API request URL
 * @private
 * @returns {string} Complete API URL with key
 */
const buildApiUrl = () => {
    return `${CONFIG.GEMINI.API_URL}/${CONFIG.GEMINI.MODEL}:generateContent?key=${CONFIG.GEMINI.API_KEY}`;
};

/**
 * Prepares context string from team and events data
 * @private
 * @param {Array} teamMembers - Array of team member objects
 * @param {Object} events - Events data with upcomingEvents and pastEvents
 * @returns {string} Formatted context string for AI
 */
const prepareContext = (teamMembers, events) => {
    const teamContext = `### LIVE TEAM DATA START ###
Team members list (JSON array, use this data source for current roles/names):
${JSON.stringify(teamMembers, null, 2)}
### LIVE TEAM DATA END ###`;

    const eventContext = `### LIVE EVENT DATA START ###
Events list (JSON array, use this data source for current/upcoming events):
${JSON.stringify(events.upcomingEvents, null, 2)}
### LIVE EVENT DATA END ###

If there is no upcoming event, mention past events:
${JSON.stringify(events.pastEvents, null, 2)}
### LIVE PAST EVENT DATA END ###`;

    return `${teamContext}\n\n${eventContext}`;
};

/**
 * Validates AI response structure
 * @private
 * @param {Object} response - Axios response object
 * @returns {string} Extracted text from AI response
 * @throws {Error} If response structure is invalid
 */
const validateAndExtractResponse = (response) => {
    if (response.status !== HTTP_STATUS.OK) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Empty or invalid response from AI model');
    }

    return text;
};

/**
 * Generate AI response using Gemini API with team and event context
 * @async
 * @param {string} query - User's question
 * @param {Array} [teamMembers=[]] - Current team members data
 * @param {Object} [events={upcomingEvents:[], pastEvents:[]}] - Events data
 * @returns {Promise<string>} AI generated response
 * @throws {Error} If API call fails or response is invalid
 * @example
 * const response = await generateAIResponse(
 *   "Who is the president?",
 *   teamData,
 *   eventsData
 * );
 */
export const generateAIResponse = async (
    query,
    teamMembers = [],
    events = { upcomingEvents: [], pastEvents: [] }
) => {
    // Input validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Error('Query must be a non-empty string');
    }

    try {
        // Prepare request
        const context = prepareContext(teamMembers, events);
        const finalPrompt = `${context}\n\nUser Query: ${query}`;
        const url = buildApiUrl();

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: finalPrompt }]
            }],
            systemInstruction: {
                parts: [{ text: CONFIG.GEMINI.SYSTEM_PROMPT }]
            }
        };

        console.log(`${LOG_PREFIX.GEMINI} Generating response for query:`, query.substring(0, 50) + '...');

        // Make API call with retry logic
        const response = await retryWithBackoff(async () => {
            return await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000, // 30 second timeout
            });
        });

        // Validate and extract response
        const aiResponse = validateAndExtractResponse(response);

        console.log(`${LOG_PREFIX.GEMINI} Successfully generated response`);
        return aiResponse;

    } catch (error) {
        console.error(`${LOG_PREFIX.GEMINI} Error generating response:`, error);

        // Handle specific error cases
        if (error.response?.status === HTTP_STATUS.BAD_REQUEST ||
            error.response?.status === HTTP_STATUS.FORBIDDEN) {
            return ERROR_MESSAGES.API_CONFIG_ERROR;
        }

        if (error.message === 'Empty or invalid response from AI model') {
            return ERROR_MESSAGES.EMPTY_RESPONSE;
        }

        if (error.code === 'ECONNABORTED') {
            return 'Request timed out. Please try again with a shorter query.';
        }

        return ERROR_MESSAGES.NETWORK_ERROR;
    }
};

/**
 * Health check for Gemini API
 * @async
 * @returns {Promise<boolean>} True if API is accessible
 */
export const checkGeminiHealth = async () => {
    try {
        const testQuery = "Hello";
        await generateAIResponse(testQuery, [], { upcomingEvents: [], pastEvents: [] });
        return true;
    } catch (error) {
        console.error(`${LOG_PREFIX.GEMINI} Health check failed:`, error);
        return false;
    }
};

export default {
    generateAIResponse,
    checkGeminiHealth,
};
