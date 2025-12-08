/**
 * @fileoverview Configuration and constants for the FED Chatbot application
 * @module config/constants
 * @author FED KIIT Development Team
 */

/**
 * Validates that all required environment variables are present
 * @throws {Error} If required environment variables are missing
 * @returns {void}
 */
const validateEnvironment = () => {
    const requiredVars = [
        'VITE_API_BASE_URL',
        'VITE_GEMINI_API_KEY',
        'VITE_GEMINI_MODEL',
        'VITE_CHATBOT_NAME'
    ];

    const missing = requiredVars.filter(varName => !import.meta.env[varName]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file and ensure all required variables are set.'
        );
    }
};

// Validate environment on module load
validateEnvironment();

/**
 * Application configuration object
 * @const {Object}
 */
export const CONFIG = Object.freeze({
    /**
     * API endpoints configuration
     */
    API: {
        BASE_URL: import.meta.env.VITE_API_BASE_URL,
        TEAM_ENDPOINT: '/api/user/fetchTeam',
        EVENTS_ENDPOINT: '/api/form/getAllForms',
    },

    /**
     * Gemini AI configuration
     */
    GEMINI: {
        API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
        MODEL: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp',
        API_URL: import.meta.env.VITE_GEMINI_API_URL ||
            'https://generativelanguage.googleapis.com/v1beta/models',
        SYSTEM_PROMPT: import.meta.env.VITE_SYSTEM_PROMPT,
    },

    /**
     * Chatbot settings
     */
    CHATBOT: {
        NAME: import.meta.env.VITE_CHATBOT_NAME || 'AskFED',
        MODE: import.meta.env.VITE_CHATBOT_MODE || 'standalone',
    },

    /**
     * Cache configuration
     */
    CACHE: {
        TEAM_DURATION: parseInt(import.meta.env.VITE_TEAM_CACHE_DURATION) || 120000,
        EVENTS_DURATION: parseInt(import.meta.env.VITE_EVENTS_CACHE_DURATION) || 120000,
    },

    /**
     * Retry configuration for API calls
     */
    RETRY: {
        MAX_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_RETRIES) || 3,
        INITIAL_DELAY: parseInt(import.meta.env.VITE_INITIAL_RETRY_DELAY) || 1000,
    },
});

/**
 * HTTP status codes
 * @const {Object}
 */
export const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
});

/**
 * Error messages
 * @const {Object}
 */
export const ERROR_MESSAGES = Object.freeze({
    NETWORK_ERROR: "Sorry, I'm having trouble connecting to the server. Please try again later.",
    API_CONFIG_ERROR: 'Error: An API configuration issue occurred. Please contact support.',
    EMPTY_RESPONSE: 'Sorry, I received an empty response. Please try a different query.',
    INVALID_INPUT: 'Please enter a valid message.',
    CACHE_ERROR: 'Failed to cache data. Using fresh data.',
});

/**
 * Success messages
 * @const {Object}
 */
export const SUCCESS_MESSAGES = Object.freeze({
    DATA_FETCHED: 'Data fetched successfully',
    CACHE_HIT: 'Using cached data',
    CACHE_UPDATED: 'Cache updated successfully',
});

/**
 * Log prefixes for consistent logging
 * @const {Object}
 */
export const LOG_PREFIX = Object.freeze({
    TEAM: '[TeamDataManager]',
    EVENTS: '[EventsDataManager]',
    GEMINI: '[GeminiAPI]',
    CHATBOT: '[ChatbotAPI]',
});

export default CONFIG;
