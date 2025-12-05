import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fedkiit.com';

const teamAPI = {
    /**
     * Fetch all team members from FED backend
     * Same method as the website uses
     */
    fetchTeamMembers: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/user/fetchTeam`);

            if (response.status === 200 && response.data.success) {
                // Filter out null names (same as website)
                const validMembers = response.data.data.filter(
                    (member) => member.name !== null
                );

                // Sort by year (descending) then by name
                const sortedMembers = validMembers.sort((a, b) => {
                    if (b.year !== a.year) {
                        return b.year - a.year;
                    }
                    return a.name.localeCompare(b.name);
                });

                return sortedMembers;
            }

            return [];
        } catch (error) {
            console.error('Error fetching team members:', error);
            return [];
        }
    },

    /**
     * Find member by name
     */
    findByName: async (name) => {
        const members = await teamAPI.fetchTeamMembers();
        const lowerName = name.toLowerCase();
        return members.find(m =>
            m.name?.toLowerCase().includes(lowerName)
        );
    },

    /**
     * Find members by role/access type
     */
    findByRole: async (role) => {
        const members = await teamAPI.fetchTeamMembers();
        return members.filter(m =>
            m.access === role || m.access?.includes(role)
        );
    },

    /**
     * Get board members (directors and above)
     */
    getBoardMembers: async () => {
        const boardAccessCodes = [
            "PRESIDENT", "VICEPRESIDENT",
            "DIRECTOR_TECHNICAL", "DIRECTOR_CREATIVE",
            "DIRECTOR_MARKETING", "DIRECTOR_OPERATIONS",
            "DIRECTOR_PR_AND_FINANCE", "DIRECTOR_HUMAN_RESOURCE"
        ];

        const members = await teamAPI.fetchTeamMembers();
        return members.filter(m => boardAccessCodes.includes(m.access));
    },

    /**
     * Search members by query
     */
    searchMembers: async (query) => {
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
