/**
 * Test class for CaseTrigger - put this code through its paces like a ship in a storm!
 * Verifies that open case counts be accurate across all scenarios
 */
@isTest
private class CaseTriggerTest {
    
    /**
     * Arr! Set up test data - create Accounts and Cases for our adventures
     */
    @testSetup
    static void setupTestData() {
        // Create test Accounts - two fine vessels for our test voyage
        List<Account> testAccounts = new List<Account>{
            new Account(Name = 'Test Account 1', Open_Cases_Count__c = 0),
            new Account(Name = 'Test Account 2', Open_Cases_Count__c = 0)
        };
        insert testAccounts;
    }
    
    /**
     * Test insertin' new Cases - should update the Account's open case count, savvy?
     */
    @isTest
    static void testInsertCases() {
        Account testAccount = [SELECT Id, Open_Cases_Count__c FROM Account WHERE Name = 'Test Account 1' LIMIT 1];
        
        Test.startTest();
        // Create three open cases - like three ships settin' sail!
        List<Case> testCases = new List<Case>{
            new Case(AccountId = testAccount.Id, Subject = 'Case 1', Status = 'New'),
            new Case(AccountId = testAccount.Id, Subject = 'Case 2', Status = 'Working'),
            new Case(AccountId = testAccount.Id, Subject = 'Case 3', Status = 'Escalated')
        };
        insert testCases;
        Test.stopTest();
        
        // Verify the treasure - Account should have 3 open cases
        testAccount = [SELECT Id, Open_Cases_Count__c FROM Account WHERE Id = :testAccount.Id];
        System.assertEquals(3, testAccount.Open_Cases_Count__c, 'Blimey! Expected 3 open cases on the Account');
    }
    
    /**
     * Test closin' a Case - should decrease the count like a ship leavin' port
     */
    @isTest
    static void testUpdateCaseStatus() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account 1' LIMIT 1];
        
        // Create two cases first
        List<Case> testCases = new List<Case>{
            new Case(AccountId = testAccount.Id, Subject = 'Case 1', Status = 'New'),
            new Case(AccountId = testAccount.Id, Subject = 'Case 2', Status = 'New')
        };
        insert testCases;
        
        Test.startTest();
        // Close one case - send it to the depths!
        testCases[0].Status = 'Closed';
        update testCases[0];
        Test.stopTest();
        
        // Shiver me timbers! Should now have only 1 open case
        testAccount = [SELECT Id, Open_Cases_Count__c FROM Account WHERE Id = :testAccount.Id];
        System.assertEquals(1, testAccount.Open_Cases_Count__c, 'Arr! Expected 1 open case after closin\' one');
    }
    
    /**
     * Test movin' a Case to a different Account - like transferrin' cargo between ships
     */
    @isTest
    static void testMoveCaseToAnotherAccount() {
        List<Account> accounts = [SELECT Id FROM Account ORDER BY Name];
        Account account1 = accounts[0];
        Account account2 = accounts[1];
        
        // Create case on first Account
        Case testCase = new Case(AccountId = account1.Id, Subject = 'Case 1', Status = 'New');
        insert testCase;
        
        Test.startTest();
        // Move the case to the second Account - change of course!
        testCase.AccountId = account2.Id;
        update testCase;
        Test.stopTest();
        
        // Verify both Accounts - first should have 0, second should have 1
        Map<Id, Account> accountMap = new Map<Id, Account>(
            [SELECT Id, Open_Cases_Count__c FROM Account WHERE Id IN :new List<Id>{account1.Id, account2.Id}]
        );
        
        System.assertEquals(0, accountMap.get(account1.Id).Open_Cases_Count__c, 'First Account should have 0 cases');
        System.assertEquals(1, accountMap.get(account2.Id).Open_Cases_Count__c, 'Second Account should have 1 case');
    }
    
    /**
     * Test deletin' a Case - make it walk the plank!
     */
    @isTest
    static void testDeleteCase() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account 1' LIMIT 1];
        
        Case testCase = new Case(AccountId = testAccount.Id, Subject = 'Case 1', Status = 'New');
        insert testCase;
        
        Test.startTest();
        // Delete the case - send it overboard!
        delete testCase;
        Test.stopTest();
        
        // Account should have 0 open cases now
        testAccount = [SELECT Id, Open_Cases_Count__c FROM Account WHERE Id = :testAccount.Id];
        System.assertEquals(0, testAccount.Open_Cases_Count__c, 'Account should have 0 cases after deletion');
    }
    
    /**
     * Test undeletin' a Case - resurrect it from Davy Jones\' locker!
     */
    @isTest
    static void testUndeleteCase() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account 1' LIMIT 1];
        
        Case testCase = new Case(AccountId = testAccount.Id, Subject = 'Case 1', Status = 'New');
        insert testCase;
        delete testCase;
        
        Test.startTest();
        // Bring the case back from the dead!
        undelete testCase;
        Test.stopTest();
        
        // Account should have 1 open case again
        testAccount = [SELECT Id, Open_Cases_Count__c FROM Account WHERE Id = :testAccount.Id];
        System.assertEquals(1, testAccount.Open_Cases_Count__c, 'Account should have 1 case after undelete');
    }
    
    /**
     * Test bulk operations - handle many cases like a fleet of ships!
     */
    @isTest
    static void testBulkOperations() {
        Account testAccount = [SELECT Id FROM Account WHERE Name = 'Test Account 1' LIMIT 1];
        
        // Create 200 cases - a mighty armada!
        List<Case> bulkCases = new List<Case>();
        for (Integer i = 0; i < 200; i++) {
            bulkCases.add(new Case(
                AccountId = testAccount.Id,
                Subject = 'Bulk Case ' + i,
                Status = 'New'
            ));
        }
        
        Test.startTest();
        insert bulkCases;
        Test.stopTest();
        
        // Verify all 200 cases be counted
        testAccount = [SELECT Id, Open_Cases_Count__c FROM Account WHERE Id = :testAccount.Id];
        System.assertEquals(200, testAccount.Open_Cases_Count__c, 'Account should have 200 open cases');
    }
}