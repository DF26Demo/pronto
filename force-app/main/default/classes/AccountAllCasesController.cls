public with sharing class AccountAllCasesController {
    /**
     * Arr! This method fetches ALL cases for a given account,
     * sorted by created date (newest treasures first, ye scallywag!)
     * @param accountId The ID of the account we're plunderin' cases from
     * @return List of all Case records
     */
    @AuraEnabled(cacheable=true)
    public static List<Case> getAllCases(Id accountId) {
        try {
            // Hoist the anchor and sail through the database to fetch all cases!
            return [
                SELECT Id, CaseNumber, Subject, Status, Priority, CreatedDate, Owner.Name
                FROM Case
                WHERE AccountId = :accountId
                ORDER BY CreatedDate DESC
                LIMIT 500
            ];
        } catch (Exception e) {
            // If we hit rough seas and the kraken attacks, throw an error message
            throw new AuraHandledException('Blimey! Failed to fetch cases: ' + e.getMessage());
        }
    }
}
