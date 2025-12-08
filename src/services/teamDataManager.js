/**
 * @fileoverview Team data management service with intelligent caching
 * @module services/teamDataManager
 * @author FED KIIT Development Team
 */

import teamAPI from './teamAPI';
import { CONFIG, LOG_PREFIX } from '../config/constants';

/**
 * Team data manager with caching and utility methods
 * Implements singleton pattern for application-wide cache consistency
 * @class
 */
class TeamDataManager {
    constructor() {
        this.cachedData = null;
        this.lastFetch = null;
        this.cacheTimeout = CONFIG.CACHE.TEAM_DURATION;
        this.isFetching = false;
    }

    /**
     * Get team members with smart caching
     * @async
     * @returns {Promise<Array>} Array of team member objects
     */
    async getMembers() {
        const now = Date.now();

        // Return cached data if still fresh
        if (
            this.cachedData &&
            this.lastFetch &&
            (now - this.lastFetch < this.cacheTimeout)
        ) {
            console.log(`${LOG_PREFIX.TEAM} Returning cached data`);
            return this.cachedData;
        }

        // Prevent duplicate fetches
        if (this.isFetching) {
            console.log(`${LOG_PREFIX.TEAM} Fetch in progress, waiting...`);
            await new Promise(resolve => setTimeout(resolve, 100));
            return this.getMembers();
        }

        // Fetch fresh data
        this.isFetching = true;
        try {
            console.log(`${LOG_PREFIX.TEAM} Fetching fresh data from API...`);
            const freshData = await teamAPI.fetchTeamMembers();

            this.cachedData = freshData;
            this.lastFetch = now;

            console.log(`${LOG_PREFIX.TEAM} Fetched ${freshData.length} members`);
            return freshData;
        } catch (error) {
            console.error(`${LOG_PREFIX.TEAM} Failed to fetch:`, error);
            return this.cachedData || [];
        } finally {
            this.isFetching = false;
        }
    }

    /**
     * Force refresh cache
     * @async
     * @returns {Promise<Array>} Fresh team data
     */
    async refresh() {
        this.lastFetch = null;
        return this.getMembers();
    }

    /**
     * Clear cache
     * @returns {void}
     */
    clearCache() {
        this.cachedData = null;
        this.lastFetch = null;
        console.log(`${LOG_PREFIX.TEAM} Cache cleared`);
    }

    /**
     * Find member by name
     * @async
     * @param {string} name - Member name to search for
     * @returns {Promise<Object|undefined>} Member object or undefined
     */
    async findByName(name) {
        const members = await this.getMembers();
        const lowerName = name.toLowerCase();
        return members.find(m =>
            m.name?.toLowerCase().includes(lowerName)
        );
    }

    /**
     * Find members by role
     * @async
     * @param {string} role - Role/access code
     * @returns {Promise<Array>} Array of matching members
     */
    async findByRole(role) {
        const members = await this.getMembers();
        return members.filter(m =>
            m.access === role || m.access?.includes(role)
        );
    }

    /**
     * Get board members (leadership roles)
     * @async
     * @returns {Promise<Array>} Array of board members
     */
    async getBoardMembers() {
        const members = await this.getMembers();
        const boardAccessCodes = [
            "PRESIDENT", "VICEPRESIDENT",
            "DIRECTOR_TECHNICAL", "DIRECTOR_CREATIVE",
            "DIRECTOR_MARKETING", "DIRECTOR_OPERATIONS",
            "DIRECTOR_PR_AND_FINANCE", "DIRECTOR_HUMAN_RESOURCE"
        ];
        return members.filter(m => boardAccessCodes.includes(m.access));
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getCacheStats() {
        const now = Date.now();
        const cacheAge = this.lastFetch ? now - this.lastFetch : null;

        return {
            memberCount: this.cachedData?.length || 0,
            lastFetchTime: this.lastFetch,
            cacheAge: cacheAge,
            cacheDuration: this.cacheTimeout,
            isFresh: cacheAge !== null && cacheAge < this.cacheTimeout,
            isFetching: this.isFetching,
        };
    }
}

// Singleton instance for application-wide cache
export const teamDataManager = new TeamDataManager();

// Convenience function for direct access
export const fetchTeamData = () => teamDataManager.getMembers();

export default teamDataManager;
