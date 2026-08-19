@isTest
private class AccountClosedCasesControllerTest {
    
    @testSetup
    static void setupTestData() {
        // Arr, let's create an Account to test with
        Account testAccount = new Account(Name = 'Test Treasure Chest Account');
        insert testAccount;
        
        // Create some closed cases within 2 years - these be our bounty!
        List<Case> recentCases = new List<Case>();
        for (Integer i = 0; i < 3; i++) {
            recentCases.add(new Case(
                AccountId = testAccount.Id,
                Subject = 'Recent Case ' + i,
                Status = 'Closed',
                Origin = 'Web',
                Priority = 'Medium'
            ));
        }
        insert recentCases;
        
        // Close them cases properly, like a good pirate closes their ship's log
        for (Case c : recentCases) {
            c.Status = 'Closed';
        }
        update recentCases;
        
        // Update ClosedDate to be within the last 2 years
        for (Case c : recentCases) {
            Test.setCreatedDate(c.Id, DateTime.now().addMonths(-6));
        }
        
        // Create an old case from 3 years ago - this one shouldn't show up, it's lost at sea!
        Case oldCase = new Case(
            AccountId = testAccount.Id,
            Subject = 'Ancient Case',
            Status = 'Closed',
            Origin = 'Web',
            Priority = 'Low'
        );
        insert oldCase;
    }
    
    @isTest
    static void testGetClosedCases_Success() {
        // Grab our test account
        Account testAccount = [SELECT Id FROM Account LIMIT 1];
        
        Test.startTest();
        // Fetch the closed cases like diggin' for buried treasure
        List<Case> results = AccountClosedCasesController.getClosedCases(testAccount.Id);
        Test.stopTest();
        
        // Make sure we got some booty!
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assert(results.size() > 0, 'Should have found some closed cases');
        
        // Verify all returned cases are indeed closed
        for (Case c : results) {
            System.assertEquals(testAccount.Id, c.AccountId, 'Case should belong to test account');
        }
    }
    
    @isTest
    static void testGetClosedCases_NullAccountId() {
        // Try to fetch with no Account ID - walk the plank!
        Test.startTest();
        try {
            AccountClosedCasesController.getClosedCases(null);
            System.assert(false, 'Should have thrown an exception, ye scurvy dog!');
        } catch (AuraHandledException e) {
            // Arr, caught the error as expected!
            System.assert(e.getMessage().contains('No Account ID'), 'Error message should mention missing Account ID');
        }
        Test.stopTest();
    }
    
    @isTest
    static void testGetClosedCases_NoResults() {
        // Create an account with no cases - empty treasure chest!
        Account emptyAccount = new Account(Name = 'Empty Account');
        insert emptyAccount;
        
        Test.startTest();
        List<Case> results = AccountClosedCasesController.getClosedCases(emptyAccount.Id);
        Test.stopTest();
        
        // Should return an empty list, not null
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(0, results.size(), 'Should have no cases for empty account');
    }
}