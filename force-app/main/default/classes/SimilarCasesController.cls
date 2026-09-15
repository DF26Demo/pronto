public with sharing class SimilarCasesController {
    
    /**
     * Arr, this method searches the database for cases with similar subjects
     * It be using keyword matching to find yer treasure!
     */
    @AuraEnabled(cacheable=true)
    public static List<Case> findSimilarCases(String caseId) {
        try {
            // First, fetch the current case to extract keywords from its subject
            Case currentCase = [SELECT Id, Subject FROM Case WHERE Id = :caseId LIMIT 1];
            
            if (currentCase == null || String.isBlank(currentCase.Subject)) {
                // Blimey! No subject to search with - return empty handed
                return new List<Case>();
            }
            
            // Split the subject into words and build a search query, ye scallywag
            String subject = currentCase.Subject;
            List<String> keywords = extractKeywords(subject);
            
            if (keywords.isEmpty()) {
                return new List<Case>();
            }
            
            // Build SOSL query to search across case subjects
            // Avast! We search for cases with matching keywords
            String searchQuery = String.join(keywords, ' OR ');
            String soslQuery = 'FIND {' + searchQuery + '} IN ALL FIELDS RETURNING Case(Id, CaseNumber, Subject, Status, Priority, OwnerId, Owner.Name WHERE Id != :caseId) LIMIT 10';
            
            List<List<SObject>> searchResults = Search.query(soslQuery);
            
            if (!searchResults.isEmpty() && !searchResults[0].isEmpty()) {
                // Success! We found similar cases on the high seas
                return (List<Case>) searchResults[0];
            }
            
            return new List<Case>();
            
        } catch (Exception e) {
            // Walk the plank! Log the error and throw it back
            System.debug('Error finding similar cases: ' + e.getMessage());
            throw new AuraHandledException('Unable to find similar cases: ' + e.getMessage());
        }
    }
    
    /**
     * Extract important keywords from the subject line
     * This filters out common words that won't help our search, matey
     */
    private static List<String> extractKeywords(String subject) {
        // Common words to ignore (stop words) - they be as useful as a broken compass
        Set<String> stopWords = new Set<String>{
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
        };
        
        List<String> keywords = new List<String>();
        
        // Split the subject into words and keep only meaningful ones
        for (String word : subject.toLowerCase().split('\\s+')) {
            // Clean up the word - remove special characters
            word = word.replaceAll('[^a-z0-9]', '');
            
            // Only keep words that are longer than 2 characters and not stop words
            if (word.length() > 2 && !stopWords.contains(word)) {
                keywords.add(word);
            }
        }
        
        return keywords;
    }
}