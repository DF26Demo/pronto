/**
 * Shiver me timbers! This helper class does the heavy liftin' for the Case trigger
 * Counts open cases and updates the Account accordingly
 */
public class CaseTriggerHelper {
    
    /**
     * Arr, this method counts open cases for each Account and updates 'em
     * @param accountIds Set of Account IDs that need their case count refreshed
     */
    public static void updateAccountOpenCaseCount(Set<Id> accountIds) {
        // Navigate to all Cases that be open (not Closed) for these Accounts
        Map<Id, Integer> accountOpenCaseCountMap = new Map<Id, Integer>();
        
        // Count cases that haven't been closed yet - they're still sailin' the seas!
        for (AggregateResult ar : [
            SELECT AccountId, COUNT(Id) caseCount
            FROM Case
            WHERE AccountId IN :accountIds
            AND IsClosed = false
            GROUP BY AccountId
        ]) {
            accountOpenCaseCountMap.put(
                (Id)ar.get('AccountId'),
                (Integer)ar.get('caseCount')
            );
        }
        
        // Prepare the Accounts for updatin' - even if the count be zero!
        List<Account> accountsToUpdate = new List<Account>();
        for (Id accId : accountIds) {
            accountsToUpdate.add(new Account(
                Id = accId,
                Open_Cases_Count__c = accountOpenCaseCountMap.containsKey(accId) 
                    ? accountOpenCaseCountMap.get(accId) 
                    : 0  // No open cases? Set it to zero, ye landlubber!
            ));
        }
        
        // Hoist the colors and update those Accounts!
        if (!accountsToUpdate.isEmpty()) {
            update accountsToUpdate;
        }
    }
}