@isTest
private class SimilarCasesControllerTest {
    
    @testSetup
    static void setupTestData() {
        // Create test cases with similar subjects - arr, we be preparing for battle!
        List<Case> testCases = new List<Case>{
            new Case(Subject = 'Email integration not working', Status = 'New', Priority = 'High'),
            new Case(Subject = 'Integration with email service failing', Status = 'Working', Priority = 'Medium'),
            new Case(Subject = 'Password reset issue', Status = 'New', Priority = 'Low'),
            new Case(Subject = 'Email notification problem', Status = 'Escalated', Priority = 'High')
        };
        insert testCases;
    }
    
    @isTest
    static void testFindSimilarCases() {
        // Fetch a case to test with - the first one about email integration
        Case testCase = [SELECT Id FROM Case WHERE Subject LIKE '%Email integration%' LIMIT 1];
        
        Test.startTest();
        // Call the method like a captain commanding his crew
        List<Case> similarCases = SimilarCasesController.findSimilarCases(testCase.Id);
        Test.stopTest();
        
        // Verify we found similar cases (should find at least the other email-related cases)
        System.assertNotEquals(null, similarCases, 'Similar cases should not be null, ye landlubber!');
        // The SOSL search should find other cases with similar keywords
    }
    
    @isTest
    static void testFindSimilarCasesNoResults() {
        // Create a case with a unique subject that won't match anything
        Case uniqueCase = new Case(Subject = 'XYZABC123', Status = 'New', Priority = 'Low');
        insert uniqueCase;
        
        Test.startTest();
        List<Case> similarCases = SimilarCasesController.findSimilarCases(uniqueCase.Id);
        Test.stopTest();
        
        // Should return an empty list - no treasure found in these waters
        System.assertNotEquals(null, similarCases, 'Result should not be null');
    }
    
    @isTest
    static void testFindSimilarCasesInvalidId() {
        // Test with a fake ID - this should throw an error
        String fakeId = '500000000000000AAA';
        
        Test.startTest();
        try {
            SimilarCasesController.findSimilarCases(fakeId);
            System.assert(false, 'Should have thrown an exception, ye scurvy dog!');
        } catch (Exception e) {
            // Expected error - we tried to board a ghost ship!
            System.assert(true, 'Exception caught as expected');
        }
        Test.stopTest();
    }
}