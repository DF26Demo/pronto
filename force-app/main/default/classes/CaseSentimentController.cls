public with sharing class CaseSentimentController {
    
    /**
     * Arr! This method fetches case comments and returns sentiment analysis
     * @param caseId The ID of the case to analyze, ye scallywag
     * @return Map containing sentiment data ready for the component
     */
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> analyzeCaseSentiment(Id caseId) {
        try {
            // Blimey! First we fetch all the comments for this case
            List<CaseComment> comments = [
                SELECT CommentBody, CreatedDate, CreatedBy.Name
                FROM CaseComment
                WHERE ParentId = :caseId
                ORDER BY CreatedDate DESC
            ];
            
            if (comments.isEmpty()) {
                // No comments? Return neutral sentiment, matey
                return new Map<String, Object>{
                    'sentiment' => 'neutral',
                    'confidence' => 0.0,
                    'commentCount' => 0,
                    'summary' => 'No comments to analyze yet, Captain.'
                };
            }
            
            // Hoist the mainsail! Combine all comments into one text block
            String allCommentsText = '';
            for (CaseComment comment : comments) {
                allCommentsText += comment.CommentBody + '\n\n';
            }
            
            // Set sail for the AI service to analyze sentiment!
            Map<String, Object> sentimentResult = CaseSentimentService.analyzeSentiment(allCommentsText);
            
            // Add the comment count to the result, ye landlubber
            sentimentResult.put('commentCount', comments.size());
            
            return sentimentResult;
            
        } catch (Exception e) {
            // Walk the plank if something goes wrong!
            throw new AuraHandledException('Avast! Error analyzing sentiment: ' + e.getMessage());
        }
    }
}