/**
 * @fileoverview Team API service for fetching team members from FED backend
 * @module services/teamAPI
 * @author FED KIIT Development Team
 * @requires axios
 * @requires config/constants
 */

import axios from 'axios';
import { CONFIG, HTTP_STATUS, LOG_PREFIX } from '../config/constants';

/**
 * Team API service
 * @namespace teamAPI
 */
const teamAPI = {
    /**
     * Fetch all team members from FED backend
     * Implements the same filtering and sorting logic as the website
     * @async
     * @returns {Promise<Array>} Sorted array of team members
     * @throws {Error} Logs error but returns empty array to prevent crashes
     */
    fetchTeamMembers: async () => {
        try {
            const url = `${CONFIG.API.BASE_URL}${CONFIG.API.TEAM_ENDPOINT}`;
            const response = await axios.get(url, {
                timeout: 10000, // 10 second timeout
            });

            if (response.status === HTTP_STATUS.OK && response.data?.success) {
                // Filter out null names (same as website)
                const validMembers = response.data.data.filter(
                    (member) => member.name !== null
                );

                // Sort by year (descending) then by name (alphabetically)
                const sortedMembers = validMembers.sort((a, b) => {
                    // Primary sort: year (newest first)
                    if (b.year !== a.year) {
                        return b.year - a.year;
                    }
                    // Secondary sort: name (alphabetically)
                    return a.name.localeCompare(b.name);
                });

                console.log(`${LOG_PREFIX.TEAM} Fetched ${sortedMembers.length} team members`);
                return sortedMembers;
            }

            console.warn(`${LOG_PREFIX.TEAM} Unexpected API response format`);
            return [];
        } catch (error) {
            console.error(`${LOG_PREFIX.TEAM} Error fetching team members:`, error.message);
            return [];
        }
    },

    /**
     * Find single member by name
     * @async
     * @param {string} name - Member name to search for
     * @returns {Promise<Object|undefined>} Member object or undefined if not found
     */
    findByName: async (name) => {
        if (!name || typeof name !== 'string') {
            console.warn(`${LOG_PREFIX.TEAM} Invalid name parameter`);
            return undefined;
        }

        const members = await teamAPI.fetchTeamMembers();
        const lowerName = name.toLowerCase();

        return members.find(m =>
            m.name?.toLowerCase().includes(lowerName)
        );
    },

    /**
     * Find members by role/access type
     * @async
     * @param {string} role - Role/access code (e.g., "PRESIDENT", "DIRECTOR_TECHNICAL")
     * @returns {Promise<Array>} Array of members with matching role
     */
    findByRole: async (role) => {
        if (!role || typeof role !== 'string') {
            console.warn(`${LOG_PREFIX.TEAM} Invalid role parameter`);
            return [];
        }

        const members = await teamAPI.fetchTeamMembers();

        return members.filter(m =>
            m.access === role || m.access?.includes(role)
        );
    },

    /**
     * Get board members (leadership positions)
     * @async
     * @returns {Promise<Array>} Array of board members
     */
    getBoardMembers: async () => {
        const boardAccessCodes = [
            "PRESIDENT",
            "VICEPRESIDENT",
            "DIRECTOR_TECHNICAL",
            "DIRECTOR_CREATIVE",
            "DIRECTOR_MARKETING",
            "DIRECTOR_OPERATIONS",
            "DIRECTOR_PR_AND_FINANCE",
            "DIRECTOR_HUMAN_RESOURCE"
        ];

        const members = await teamAPI.fetchTeamMembers();
        return members.filter(m => boardAccessCodes.includes(m.access));
    },

    /**
     * Search members by query string
     * Searches across name, access, and title fields
     * @async
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of matching members
     */
    searchMembers: async (query) => {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            console.warn(`${LOG_PREFIX.TEAM} Invalid search query`);
            return [];
        }

        const members = await teamAPI.fetchTeamMembers();
        const lowerQuery = query.toLowerCase();

        return members.filter(m =>
            m.name?.toLowerCase().includes(lowerQuery) ||
            m.access?.toLowerCase().includes(lowerQuery) ||
            m.extra?.title?.toLowerCase().includes(lowerQuery)
        );
    }
};

export default teamAPI;
