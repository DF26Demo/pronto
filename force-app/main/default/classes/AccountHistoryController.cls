public with sharing class AccountHistoryController {
    /**
     * Arr! This method fetches the account history records to show what's been
     * changed on this account over time - like a ship's log of modifications!
     * @param accountId The ID of the account whose history we're plunderin'
     * @return List of AccountHistory records with field changes
     */
    @AuraEnabled(cacheable=true)
    public static List<AccountHistory> getAccountHistory(Id accountId) {
        try {
            // Sail through the database and fetch the account's history
            // Shiver me timbers! This shows who changed what and when
            return [
                SELECT Id, Field, OldValue, NewValue, CreatedDate, CreatedBy.Name
                FROM AccountHistory
                WHERE AccountId = :accountId
                ORDER BY CreatedDate DESC
                LIMIT 500
            ];
        } catch (Exception e) {
            // Blimey! If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch account history: ' + e.getMessage());
        }
    }
}
