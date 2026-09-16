public with sharing class AccountCaseListController {
    
    /**
     * Arr! This method fetches all cases for a given account
     * @param accountId - The ID of the account whose cases we be seekin'
     * @return List of Case records, or an empty list if none be found
     */
    @AuraEnabled(cacheable=true)
    public static List<Case> getCases(Id accountId) {
        // If no account ID be provided, we return an empty hold
        if (accountId == null) {
            return new List<Case>();
        }
        
        try {
            // Hoist the anchor and fetch them cases!
            return [
                SELECT Id, CaseNumber, Subject, Status, Priority, CreatedDate
                FROM Case
                WHERE AccountId = :accountId
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            // If the seas be rough, we log the error and throw it back
            System.debug('Error fetching cases: ' + e.getMessage());
            throw new AuraHandledException('Shiver me timbers! ' + e.getMessage());
        }
    }
}