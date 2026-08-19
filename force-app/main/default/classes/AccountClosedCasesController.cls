public with sharing class AccountClosedCasesController {
    /**
     * Arr! This method fetches cases that've been closed in the last 2 years
     * for a given account, sorted by closed date (newest first)
     * @param accountId The ID of the account we're plunderin' cases from
     * @return List of closed Case records
     */
    @AuraEnabled(cacheable=true)
    public static List<Case> getClosedCases(Id accountId) {
        // Blimey! Calculate the date 2 years back from today
        Date twoYearsAgo = Date.today().addYears(-2);
        
        try {
            // Sail through the database and fetch closed cases
            return [
                SELECT Id, CaseNumber, Subject, Status, ClosedDate, Owner.Name
                FROM Case
                WHERE AccountId = :accountId
                AND IsClosed = true
                AND ClosedDate >= :twoYearsAgo
                ORDER BY ClosedDate DESC
                LIMIT 500
            ];
        } catch (Exception e) {
            // If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch closed cases: ' + e.getMessage());
        }
    }
}