public with sharing class AccountRenewalCountdownController {
    /**
     * Arr! This method fetches the renewal date for an account and calculates
     * how many days remain until the account needs renewin'
     * @param accountId The ID of the account we're checkin'
     * @return Map containing renewalDate and daysUntilRenewal
     */
    @AuraEnabled(cacheable=true)
    public static RenewalInfo getRenewalInfo(Id accountId) {
        try {
            // Sail into the database and fetch the account's renewal date
            Account acc = [SELECT Id, Renewal_Date__c FROM Account WHERE Id = :accountId LIMIT 1];
            
            RenewalInfo info = new RenewalInfo();
            
            if (acc.Renewal_Date__c != null) {
                // Calculate days until renewal, like countin' treasure!
                info.renewalDate = acc.Renewal_Date__c;
                Integer daysBetween = Date.today().daysBetween(acc.Renewal_Date__c);
                info.daysUntilRenewal = daysBetween;
            }
            
            return info;
        } catch (Exception e) {
            // If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch renewal info: ' + e.getMessage());
        }
    }
    
    /**
     * Wrapper class to hold renewal information - like a treasure chest for data!
     */
    public class RenewalInfo {
        @AuraEnabled
        public Date renewalDate { get; set; }
        
        @AuraEnabled
        public Integer daysUntilRenewal { get; set; }
    }
}