public with sharing class AccountClosedCasesController {
    
    /**
     * Arr! This method fetches all closed cases from the last 2 years for a given Account
     * Walk the plank if ye try to pass a null accountId!
     */
    @AuraEnabled(cacheable=true)
    public static List<Case> getClosedCases(Id accountId) {
        // Blimey! Make sure we got a proper Account ID
        if (accountId == null) {
            throw new AuraHandledException('No Account ID provided, ye scallywag!');
        }
        
        // Calculate the date 2 years ago - this be our treasure map boundary
        Date twoYearsAgo = Date.today().addYears(-2);
        
        try {
            // Set sail and fetch those cases!
            return [
                SELECT Id, CaseNumber, Subject, Status, ClosedDate, Priority
                FROM Case
                WHERE AccountId = :accountId
                AND IsClosed = true
                AND ClosedDate >= :twoYearsAgo
                ORDER BY ClosedDate DESC
            ];
        } catch (Exception e) {
            // Here be dragons - something went awry with our query
            throw new AuraHandledException('Error fetching closed cases: ' + e.getMessage());
        }
    }
}