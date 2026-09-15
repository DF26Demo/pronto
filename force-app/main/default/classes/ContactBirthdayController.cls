public with sharing class ContactBirthdayController {
    
    // Ahoy! This method fetches all contacts with birthdays from the database treasure chest
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsWithBirthdays() {
        try {
            // Query the seven seas for contacts with birthdays, matey!
            return [
                SELECT Id, Name, Birthdate 
                FROM Contact 
                WHERE Birthdate != null
                ORDER BY Name
                LIMIT 200
            ];
        } catch (Exception e) {
            // Shiver me timbers, something went wrong!
            throw new AuraHandledException('Error fetching contacts: ' + e.getMessage());
        }
    }
}