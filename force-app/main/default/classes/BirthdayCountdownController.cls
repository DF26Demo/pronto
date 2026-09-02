// Ahoy! This Apex controller fetches a contact's birthdate from the database
public with sharing class BirthdayCountdownController {
    
    // Sail into the database and retrieve the birthdate, or return null if none be found
    @AuraEnabled(cacheable=true)
    public static Date getContactBirthdate(Id contactId) {
        try {
            // Query the contact's birthdate from the treasure trove (database)
            Contact contact = [SELECT Birthdate FROM Contact WHERE Id = :contactId LIMIT 1];
            return contact.Birthdate;
        } catch (Exception e) {
            // Walk the plank if something goes wrong!
            throw new AuraHandledException('Error fetching birthdate: ' + e.getMessage());
        }
    }
}