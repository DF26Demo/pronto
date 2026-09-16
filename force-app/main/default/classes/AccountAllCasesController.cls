public with sharing class AccountAllCasesController {
    /**
     * Arr! This method fetches ALL cases for a given account,
     * sorted by created date (newest first)
     * @param accountId The ID of the account we're plunderin' cases from
     * @return List of all Case records
     */
    @AuraEnabled(cacheable=true)
    public static List<Case> getAllCases(Id accountId) {
        try {
            // Sail through the database and fetch all cases, matey!
            return [
                SELECT Id, CaseNumber, Subject, Status, Priority, 
                       CreatedDate, Owner.Name, IsClosed
                FROM Case
                WHERE AccountId = :accountId
                ORDER BY CreatedDate DESC
                LIMIT 500
            ];
        } catch (Exception e) {
            // Blimey! If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch cases: ' + e.getMessage());
        }
    }
}