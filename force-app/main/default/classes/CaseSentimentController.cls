// Ahoy! This be the Apex crew that analyzes customer sentiment from case comments
public with sharing class CaseSentimentController {
    
    // This method sails through all case comments and returns the overall sentiment
    @AuraEnabled(cacheable=false)
    public static SentimentResult analyzeSentiment(Id caseId) {
        try {
            // Fetch all the comments for this case, ordered by most recent first
            List<CaseComment> comments = [
                SELECT CommentBody, CreatedDate 
                FROM CaseComment 
                WHERE ParentId = :caseId 
                ORDER BY CreatedDate DESC
            ];
            
            // If no comments exist, return neutral sentiment
            if (comments.isEmpty()) {
                return new SentimentResult('Neutral', 0.0);
            }
            
            // Blimey! Combine all comment text for analysis
            String allComments = '';
            for (CaseComment comment : comments) {
                allComments += comment.CommentBody + ' ';
            }
            
            // Here be where we analyze the sentiment - using keyword matching
            // In a real treasure hunt, ye might use Einstein AI or external API
            SentimentResult result = analyzeText(allComments);
            
            return result;
            
        } catch (Exception e) {
            // Shiver me timbers! Something went wrong
            throw new AuraHandledException('Error analyzing sentiment: ' + e.getMessage());
        }
    }
    
    // This private method does the actual sentiment analysis
    // Arr! This be a simple keyword-based approach - upgrade to Einstein AI for better accuracy
    private static SentimentResult analyzeText(String text) {
        String lowerText = text.toLowerCase();
        
        // Count positive and negative keywords like countin' doubloons
        Integer positiveCount = 0;
        Integer negativeCount = 0;
        
        // Positive keywords - words that signal smooth sailin'
        List<String> positiveWords = new List<String>{
            'thank', 'thanks', 'great', 'excellent', 'happy', 'pleased', 
            'wonderful', 'fantastic', 'good', 'appreciate', 'love', 'perfect',
            'amazing', 'awesome', 'satisfied', 'helpful'
        };
        
        // Negative keywords - storm warnings!
        List<String> negativeWords = new List<String>{
            'angry', 'frustrated', 'upset', 'disappointed', 'terrible', 
            'horrible', 'bad', 'worst', 'poor', 'awful', 'hate', 'issue',
            'problem', 'broken', 'not working', 'fails', 'error', 'wrong'
        };
        
        // Count how many positive words we find
        for (String word : positiveWords) {
            positiveCount += countOccurrences(lowerText, word);
        }
        
        // Count how many negative words we find
        for (String word : negativeWords) {
            negativeCount += countOccurrences(lowerText, word);
        }
        
        // Calculate sentiment based on the balance of positive vs negative
        Integer totalCount = positiveCount + negativeCount;
        
        if (totalCount == 0) {
            // No sentiment words found - neutral waters
            return new SentimentResult('Neutral', 0.5);
        }
        
        // Calculate the sentiment score (0 = negative, 1 = positive)
        Decimal score = Decimal.valueOf(positiveCount) / Decimal.valueOf(totalCount);
        
        String sentiment;
        if (score > 0.6) {
            sentiment = 'Positive';
        } else if (score < 0.4) {
            sentiment = 'Negative';
        } else {
            sentiment = 'Neutral';
        }
        
        return new SentimentResult(sentiment, score);
    }
    
    // Helper method to count how many times a word appears in text
    private static Integer countOccurrences(String text, String word) {
        Integer count = 0;
        Integer index = 0;
        // Keep searchin' until we've found all instances
        while ((index = text.indexOf(word, index)) != -1) {
            count++;
            index += word.length();
        }
        return count;
    }
    
    // This be the result class that holds our sentiment treasure
    public class SentimentResult {
        @AuraEnabled public String sentiment;
        @AuraEnabled public Decimal score;
        
        public SentimentResult(String sentiment, Decimal score) {
            this.sentiment = sentiment;
            this.score = score;
        }
    }
}