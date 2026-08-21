public with sharing class BirthdayCountdownController {
    /**
     * Arr! Fetch the birthdate from the contact record, or return null if we find no treasure
     */
    @AuraEnabled(cacheable=true)
    public static Date getBirthdate(Id contactId) {
        try {
            // Set sail to query the contact's birthdate
            Contact contact = [SELECT Birthdate FROM Contact WHERE Id = :contactId LIMIT 1];
            return contact.Birthdate;
        } catch (Exception e) {
            // Blimey! If the query fails, we walk the plank and throw an error
            throw new AuraHandledException('Error fetching birthdate: ' + e.getMessage());
        }
    }
}