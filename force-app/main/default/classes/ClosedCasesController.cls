public with sharing class ClosedCasesController {
    /**
     * Arr, this method fetches all closed cases for a given Account
     * @param accountId The ID of the Account whose cases we be huntin'
     * @return List of closed Cases, or an empty list if none be found
     */
    @AuraEnabled(cacheable=true)
    public static List<Case> getClosedCases(Id accountId) {
        try {
            // Here be the SOQL query that sails through the database
            // Fetch only cases where Status be 'Closed' and they belong to the account
            return [
                SELECT Id, CaseNumber, Subject, ClosedDate, Reason, Priority, Status
                FROM Case
                WHERE AccountId = :accountId 
                AND IsClosed = true
                ORDER BY ClosedDate DESC
                LIMIT 100
            ];
        } catch (Exception e) {
            // Shiver me timbers! If something goes wrong, throw an AuraHandledException
            throw new AuraHandledException('Error fetching closed cases: ' + e.getMessage());
        }
    }
}