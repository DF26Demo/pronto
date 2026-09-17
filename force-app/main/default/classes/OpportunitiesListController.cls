public with sharing class OpportunitiesListController {
    /**
     * Arr! This method fetches all opportunities for the current user
     * Perfect for viewing yer treasure trove of deals!
     * @return List of Opportunity records owned by the current user
     */
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getMyOpportunities() {
        try {
            // Sail through the database and fetch the current user's opportunities
            // Sorted by close date so ye can see what's comin' up on the horizon
            return [
                SELECT Id, Name, StageName, Amount, CloseDate, Account.Name
                FROM Opportunity
                WHERE OwnerId = :UserInfo.getUserId()
                ORDER BY CloseDate ASC
                LIMIT 500
            ];
        } catch (Exception e) {
            // If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch opportunities: ' + e.getMessage());
        }
    }
}