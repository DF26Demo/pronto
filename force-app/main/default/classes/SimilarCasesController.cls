public with sharing class SimilarCasesController {
    
    /**
     * Arr! This method searches the seven seas for cases similar to the one ye be lookin' at
     * @param currentCaseId The ID of the case we be comparin' against
     * @param subject The subject of the current case, fer findin' similar titles
     * @param priority The priority level, so we can match urgent cases with urgent cases
     * @param productId The product this case be about, if there be one
     * @return A list of similar cases, ready fer plunderin'
     */
    @AuraEnabled(cacheable=true)
    public static List<CaseWrapper> getSimilarCases(
        Id currentCaseId,
        String subject,
        String priority,
        Id productId
    ) {
        List<CaseWrapper> wrappedCases = new List<CaseWrapper>();
        
        try {
            // Blimey! Extract keywords from the subject to search fer
            List<String> keywords = extractKeywords(subject);
            
            // Build the SOSL query like a pirate builds a ship - carefully!
            String searchQuery = 'FIND \'' + String.escapeSingleQuotes(keywords[0]) + '*\' IN ALL FIELDS ' +
                                'RETURNING Case(' +
                                'Id, CaseNumber, Subject, Status, Priority, CreatedDate ' +
                                'WHERE Id != \'' + currentCaseId + '\' ' +
                                'AND IsClosed = false ' +
                                'ORDER BY CreatedDate DESC ' +
                                'LIMIT 5)';
            
            // Hoist the sails and execute the search!
            List<List<SObject>> searchResults = Search.query(searchQuery);
            
            // If SOSL doesn't find treasure, we'll use SOQL as backup
            List<Case> cases;
            if (searchResults != null && !searchResults.isEmpty() && !searchResults[0].isEmpty()) {
                cases = (List<Case>) searchResults[0];
            } else {
                // Arr, SOSL failed - time fer Plan B, a proper SOQL query
                cases = findSimilarCasesWithSOQL(currentCaseId, subject, priority, productId);
            }
            
            // Wrap each case in a jolly wrapper with the URL fer navigation
            for (Case c : cases) {
                wrappedCases.add(new CaseWrapper(c));
            }
            
        } catch (Exception e) {
            // Walk the plank! Something went horribly wrong
            throw new AuraHandledException('Error finding similar cases: ' + e.getMessage());
        }
        
        return wrappedCases;
    }
    
    /**
     * This be the backup plan - a SOQL query fer when SOSL abandons ship
     */
    private static List<Case> findSimilarCasesWithSOQL(
        Id currentCaseId,
        String subject,
        String priority,
        Id productId
    ) {
        // Extract the first keyword to search with, like findin' the North Star
        String searchTerm = '%' + extractKeywords(subject)[0] + '%';
        
        return [
            SELECT Id, CaseNumber, Subject, Status, Priority, CreatedDate
            FROM Case
            WHERE Id != :currentCaseId
            AND IsClosed = false
            AND (Subject LIKE :searchTerm OR Priority = :priority)
            ORDER BY CreatedDate DESC
            LIMIT 5
        ];
    }
    
    /**
     * Extract keywords from the subject, like a pirate pickin' out the valuable cargo
     * Strips out common words that be as useful as a compass on land
     */
    private static List<String> extractKeywords(String subject) {
        if (String.isBlank(subject)) {
            return new List<String>{''};
        }
        
        // Remove common words that won't help us find treasure
        Set<String> stopWords = new Set<String>{
            'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
            'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from'
        };
        
        List<String> words = subject.toLowerCase().split('\\s+');
        List<String> keywords = new List<String>();
        
        // Plunder through the words and keep the valuable ones
        for (String word : words) {
            // Clean up the word like swabbin' the deck
            word = word.replaceAll('[^a-zA-Z0-9]', '');
            if (!String.isBlank(word) && !stopWords.contains(word) && word.length() > 2) {
                keywords.add(word);
            }
        }
        
        // If we found no keywords, just return the first word - better than nothin'!
        if (keywords.isEmpty()) {
            keywords.add(words[0].replaceAll('[^a-zA-Z0-9]', ''));
        }
        
        return keywords;
    }
    
    /**
     * Wrapper class to send case data with URLs to the component
     * Like wrappin' treasure in a nice chest fer transport
     */
    public class CaseWrapper {
        @AuraEnabled public Id Id;
        @AuraEnabled public String CaseNumber;
        @AuraEnabled public String Subject;
        @AuraEnabled public String Status;
        @AuraEnabled public String Priority;
        @AuraEnabled public String caseUrl;
        
        public CaseWrapper(Case c) {
            this.Id = c.Id;
            this.CaseNumber = c.CaseNumber;
            this.Subject = c.Subject;
            this.Status = c.Status;
            this.Priority = c.Priority;
            // Build the URL like chartin' a course to treasure
            this.caseUrl = '/' + c.Id;
        }
    }
}