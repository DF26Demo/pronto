// Test class to make sure our birthday countdown doesn't walk the plank!
@isTest
private class BirthdayCountdownControllerTest {
    
    @isTest
    static void testGetContactBirthdate() {
        // Arr, create a test contact with a birthdate
        Contact testContact = new Contact(
            FirstName = 'Jolly',
            LastName = 'Rodger',
            Birthdate = Date.newInstance(1990, 6, 15)
        );
        insert testContact;
        
        // Test that we can retrieve the birthdate successfully
        Test.startTest();
        Date birthdate = BirthdayCountdownController.getContactBirthdate(testContact.Id);
        Test.stopTest();
        
        // Verify the treasure (birthdate) matches what we stored
        System.assertEquals(Date.newInstance(1990, 6, 15), birthdate, 'Birthdate should match');
    }
    
    @isTest
    static void testGetContactBirthdateNoDate() {
        // Create a contact without a birthdate - poor soul!
        Contact testContact = new Contact(
            FirstName = 'Landlubber',
            LastName = 'Jones'
        );
        insert testContact;
        
        // Test that we handle missing birthdates gracefully
        Test.startTest();
        Date birthdate = BirthdayCountdownController.getContactBirthdate(testContact.Id);
        Test.stopTest();
        
        // Should return null if no birthdate be set
        System.assertEquals(null, birthdate, 'Should return null for missing birthdate');
    }
    
    @isTest
    static void testInvalidContactId() {
        // Try to fetch a contact that doesn't exist - abandon ship!
        Test.startTest();
        try {
            BirthdayCountdownController.getContactBirthdate('001000000000000AAA');
            System.assert(false, 'Should have thrown an exception');
        } catch (AuraHandledException e) {
            // Expected to throw an error - all hands on deck!
            System.assert(e.getMessage().contains('Failed to retrieve contact birthdate'));
        }
        Test.stopTest();
    }
}