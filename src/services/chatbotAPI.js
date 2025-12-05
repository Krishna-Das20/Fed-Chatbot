import axios from 'axios';

const CHATBOT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const chatbotAPI = {
    /**
     * Send message to chatbot backend
     */
    sendMessage: async (message, context = null) => {
        try {
            const payload = {
                input: message,
            };

            // Add context if provided
            if (context) {
                payload.context = context;
            }

            const response = await axios.post(`${CHATBOT_API_URL}/chat`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200 || response.status === 201) {
                return {
                    success: true,
                    response: response.data.response || response.data.message,
                    data: response.data,
                };
            }

            return {
                success: false,
                response: 'Sorry, I encountered an issue. Please try again.',
            };
        } catch (error) {
            console.error('[ChatbotAPI] Error:', error);
            return {
                success: false,
                response: 'Sorry, I\'m having trouble connecting to my brain right now. Please try again in a moment.',
            };
        }
    },

    /**
     * Health check
     */
    ping: async () => {
        try {
            const response = await axios.get(`${CHATBOT_API_URL}/health`);
            return response.status === 200;
        } catch (error) {
            console.error('[ChatbotAPI] Health check failed:', error);
            return false;
        }
    },
};

export default chatbotAPI;
