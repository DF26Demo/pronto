public with sharing class AccountHistoryController {
    
    // Arr! This method fetches the account history from the treasure trove
    @AuraEnabled(cacheable=true)
    public static List<AccountHistory> getAccountHistory(Id accountId) {
        try {
            // Avast! Query the AccountHistory object for this account's tales
            return [
                SELECT Id, Field, OldValue, NewValue, CreatedDate, CreatedBy.Name
                FROM AccountHistory
                WHERE AccountId = :accountId
                ORDER BY CreatedDate DESC
                LIMIT 50
            ];
        } catch (Exception e) {
            // Shiver me timbers! Something went wrong - throw an error to the deck
            throw new AuraHandledException('Failed to fetch account history: ' + e.getMessage());
        }
    }
}