// Arr! These be the tests to make sure our sentiment analyzer doesn't mutiny
@isTest
private class CaseSentimentControllerTest {
    
    @testSetup
    static void setupTestData() {
        // Create a test case to sail with
        Case testCase = new Case(
            Subject = 'Test Case for Sentiment',
            Status = 'New',
            Origin = 'Web'
        );
        insert testCase;
    }
    
    @isTest
    static void testPositiveSentiment() {
        // Test with happy customer comments - smooth sailin'!
        Case testCase = [SELECT Id FROM Case LIMIT 1];
        
        CaseComment comment = new CaseComment(
            ParentId = testCase.Id,
            CommentBody = 'Thank you so much! This is excellent service. I am very happy and satisfied.'
        );
        insert comment;
        
        Test.startTest();
        CaseSentimentController.SentimentResult result = 
            CaseSentimentController.analyzeSentiment(testCase.Id);
        Test.stopTest();
        
        // Assert that we detected positive sentiment
        System.assertEquals('Positive', result.sentiment, 'Should detect positive sentiment');
        System.assert(result.score > 0.6, 'Positive score should be high');
    }
    
    @isTest
    static void testNegativeSentiment() {
        // Test with angry customer comments - storm warning!
        Case testCase = [SELECT Id FROM Case LIMIT 1];
        
        CaseComment comment = new CaseComment(
            ParentId = testCase.Id,
            CommentBody = 'This is terrible! I am very frustrated and disappointed. The worst service ever.'
        );
        insert comment;
        
        Test.startTest();
        CaseSentimentController.SentimentResult result = 
            CaseSentimentController.analyzeSentiment(testCase.Id);
        Test.stopTest();
        
        // Assert that we detected negative sentiment
        System.assertEquals('Negative', result.sentiment, 'Should detect negative sentiment');
        System.assert(result.score < 0.4, 'Negative score should be low');
    }
    
    @isTest
    static void testNeutralSentiment() {
        // Test with neutral comments - calm waters
        Case testCase = [SELECT Id FROM Case LIMIT 1];
        
        CaseComment comment = new CaseComment(
            ParentId = testCase.Id,
            CommentBody = 'I called about my account. The representative provided information.'
        );
        insert comment;
        
        Test.startTest();
        CaseSentimentController.SentimentResult result = 
            CaseSentimentController.analyzeSentiment(testCase.Id);
        Test.stopTest();
        
        // Assert that we detected neutral sentiment
        System.assertEquals('Neutral', result.sentiment, 'Should detect neutral sentiment');
    }
    
    @isTest
    static void testNoComments() {
        // Test case with no comments - should return neutral
        Case testCase = [SELECT Id FROM Case LIMIT 1];
        
        Test.startTest();
        CaseSentimentController.SentimentResult result = 
            CaseSentimentController.analyzeSentiment(testCase.Id);
        Test.stopTest();
        
        // Assert that we get neutral sentiment when no comments exist
        System.assertEquals('Neutral', result.sentiment, 'Should return neutral when no comments');
    }
    
    @isTest
    static void testMixedSentiment() {
        // Test with both positive and negative comments - choppy seas!
        Case testCase = [SELECT Id FROM Case LIMIT 1];
        
        CaseComment comment1 = new CaseComment(
            ParentId = testCase.Id,
            CommentBody = 'Initially frustrated with the problem.'
        );
        CaseComment comment2 = new CaseComment(
            ParentId = testCase.Id,
            CommentBody = 'But thank you for the excellent resolution! Very happy now.'
        );
        insert new List<CaseComment>{ comment1, comment2 };
        
        Test.startTest();
        CaseSentimentController.SentimentResult result = 
            CaseSentimentController.analyzeSentiment(testCase.Id);
        Test.stopTest();
        
        // Should detect overall sentiment based on keyword balance
        System.assertNotEquals(null, result.sentiment, 'Should return a sentiment');
        System.assert(result.score >= 0 && result.score <= 1, 'Score should be between 0 and 1');
    }
}