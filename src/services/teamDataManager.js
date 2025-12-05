import teamAPI from './teamAPI';

class TeamDataManager {
    constructor() {
        this.cachedData = null;
        this.lastFetch = null;
        this.cacheTimeout = parseInt(import.meta.env.VITE_TEAM_CACHE_TIMEOUT) || 120000; // 2 minutes
        this.isFetching = false;
    }

    /**
     * Get team members with smart caching
     */
    async getMembers() {
        const now = Date.now();

        // Return cached data if still fresh
        if (
            this.cachedData &&
            this.lastFetch &&
            (now - this.lastFetch < this.cacheTimeout)
        ) {
            console.log('[TeamData] Returning cached data');
            return this.cachedData;
        }

        // Prevent duplicate fetches
        if (this.isFetching) {
            console.log('[TeamData] Fetch in progress, waiting...');
            await new Promise(resolve => setTimeout(resolve, 100));
            return this.getMembers();
        }

        // Fetch fresh data
        this.isFetching = true;
        try {
            console.log('[TeamData] Fetching fresh data from API...');
            const freshData = await teamAPI.fetchTeamMembers();

            this.cachedData = freshData;
            this.lastFetch = now;

            console.log(`[TeamData] Fetched ${freshData.length} members`);
            return freshData;
        } catch (error) {
            console.error('[TeamData] Failed to fetch:', error);
            return this.cachedData || [];
        } finally {
            this.isFetching = false;
        }
    }

    /**
     * Force refresh cache
     */
    async refresh() {
        this.lastFetch = null;
        return this.getMembers();
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cachedData = null;
        this.lastFetch = null;
    }

    /**
     * Find member by name
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
     */
    async findByRole(role) {
        const members = await this.getMembers();
        return members.filter(m =>
            m.access === role || m.access?.includes(role)
        );
    }

    /**
     * Get board members
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
}

// Singleton instance
export const teamDataManager = new TeamDataManager();
export default teamDataManager;
