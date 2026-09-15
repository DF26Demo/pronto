public with sharing class SimilarCasesController {
    /**
     * Arr! This method finds cases similar to the current one
     * by matching Subject keywords, Priority, Type, and Status
     * 
     * @param caseId The ID of the current case (to exclude from results)
     * @param subject The subject line to match keywords from
     * @param priority The priority level to match
     * @param caseType The case type to match
     * @param status The status to match
     * @return List of similar Case records
     */
    @AuraEnabled(cacheable=true)
    public static List<Case> getSimilarCases(
        Id caseId, 
        String subject, 
        String priority, 
        String caseType, 
        String status
    ) {
        try {
            // Blimey! If we don't have enough info, return an empty hold
            if (String.isBlank(subject)) {
                return new List<Case>();
            }

            // Arr! Extract meaningful keywords from the subject (3+ chars)
            List<String> keywords = extractKeywords(subject);
            
            if (keywords.isEmpty()) {
                return new List<Case>();
            }

            // Build a search query string for SOSL - find cases with similar words
            String searchQuery = buildSearchQuery(keywords);
            
            // Shiver me timbers! Use SOSL to search across case subjects
            List<List<SObject>> searchResults = [
                FIND :searchQuery 
                IN ALL FIELDS 
                RETURNING Case(
                    Id, CaseNumber, Subject, Status, Priority, Type, CreatedDate
                    WHERE Id != :caseId
                    ORDER BY CreatedDate DESC
                    LIMIT 50
                )
            ];
            
            List<Case> foundCases = (List<Case>)searchResults[0];
            
            // Yo ho ho! Now filter and rank by similarity
            List<CaseWithScore> scoredCases = new List<CaseWithScore>();
            
            for (Case c : foundCases) {
                Integer score = calculateSimilarityScore(
                    c, subject, priority, caseType, status
                );
                // Only include cases with a decent similarity score
                if (score > 0) {
                    scoredCases.add(new CaseWithScore(c, score));
                }
            }
            
            // Sort by score descending (most similar first)
            scoredCases.sort();
            
            // Extract just the cases from our scored list (top 20)
            List<Case> similarCases = new List<Case>();
            Integer limit = Math.min(20, scoredCases.size());
            for (Integer i = 0; i < limit; i++) {
                similarCases.add(scoredCases[i].caseRecord);
            }
            
            return similarCases;
            
        } catch (Exception e) {
            // If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch similar cases: ' + e.getMessage());
        }
    }
    
    /**
     * Arr! Extract meaningful keywords from a subject line
     * Filters out common words and keeps only substantial terms
     */
    private static List<String> extractKeywords(String subject) {
        // Common words to ignore (stop words)
        Set<String> stopWords = new Set<String>{
            'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
            'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from'
        };
        
        List<String> keywords = new List<String>();
        
        // Split by non-word characters and filter
        for (String word : subject.toLowerCase().split('[^a-z0-9]+')) {
            if (word.length() >= 3 && !stopWords.contains(word)) {
                keywords.add(word);
            }
        }
        
        return keywords;
    }
    
    /**
     * Build a SOSL search query from keywords
     */
    private static String buildSearchQuery(List<String> keywords) {
        // Take top 5 keywords for search
        Integer limit = Math.min(5, keywords.size());
        List<String> searchTerms = new List<String>();
        
        for (Integer i = 0; i < limit; i++) {
            searchTerms.add(keywords[i] + '*');
        }
        
        return String.join(searchTerms, ' OR ');
    }
    
    /**
     * Calculate a similarity score for ranking
     * Higher score = more similar
     */
    private static Integer calculateSimilarityScore(
        Case candidate,
        String originalSubject,
        String originalPriority,
        String originalType,
        String originalStatus
    ) {
        Integer score = 0;
        
        // Exact matches get bonus points
        if (candidate.Priority == originalPriority) {
            score += 30;
        }
        
        if (candidate.Type == originalType) {
            score += 30;
        }
        
        if (candidate.Status == originalStatus) {
            score += 20;
        }
        
        // Subject similarity - count matching words
        Set<String> originalWords = new Set<String>();
        for (String word : extractKeywords(originalSubject)) {
            originalWords.add(word);
        }
        
        if (String.isNotBlank(candidate.Subject)) {
            for (String word : extractKeywords(candidate.Subject)) {
                if (originalWords.contains(word)) {
                    score += 5;
                }
            }
        }
        
        return score;
    }
    
    /**
     * Wrapper class for sorting cases by similarity score
     */
    private class CaseWithScore implements Comparable {
        public Case caseRecord;
        public Integer score;
        
        public CaseWithScore(Case c, Integer s) {
            this.caseRecord = c;
            this.score = s;
        }
        
        public Integer compareTo(Object other) {
            CaseWithScore otherCase = (CaseWithScore)other;
            // Sort descending (higher scores first)
            return otherCase.score - this.score;
        }
    }
}