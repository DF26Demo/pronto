// Ahoy! This Apex controller fetches a contact's birthdate from the database
public with sharing class BirthdayCountdownController {
    
    /**
     * Arr, this method retrieves the birthdate for a given contact
     * @param contactId - The ID of the contact we be searchin' for
     * @return Date - The birthdate, or null if none be found
     */
    @AuraEnabled(cacheable=true)
    public static Date getContactBirthdate(Id contactId) {
        try {
            // Sail into the database and fetch the contact's birthdate
            Contact contact = [SELECT Birthdate FROM Contact WHERE Id = :contactId LIMIT 1];
            return contact.Birthdate;
        } catch (Exception e) {
            // Blimey! Something went wrong - throw an error message
            throw new AuraHandledException('Failed to retrieve contact birthdate: ' + e.getMessage());
        }
    }
}