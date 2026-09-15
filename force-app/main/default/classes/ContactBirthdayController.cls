public with sharing class ContactBirthdayController {
    /**
     * Arr! This method fetches a contact's birthdate so we can celebrate properly
     * @param contactId The ID of the contact whose birthday we're trackin'
     * @return Contact record with Birthdate field
     */
    @AuraEnabled(cacheable=true)
    public static Contact getContactBirthday(Id contactId) {
        try {
            // Set sail and fetch the contact's birthdate from the treasure trove
            return [
                SELECT Id, Name, Birthdate
                FROM Contact
                WHERE Id = :contactId
                LIMIT 1
            ];
        } catch (Exception e) {
            // Blimey! If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch contact birthday: ' + e.getMessage());
        }
    }
}