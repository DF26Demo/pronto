/**
 * Ahoy! This controller fetches timeline data for a Case
 * Returns a treasure chest of events including field changes, comments, and activities
 */
public with sharing class CaseTimelineController {
    
    /**
     * Blimey! Main method to gather all timeline events for a case
     * @param caseId The Id of the Case record
     * @return List of TimelineEvent wrapper objects, sorted by date
     */
    @AuraEnabled(cacheable=true)
    public static List<TimelineEvent> getTimelineData(Id caseId) {
        List<TimelineEvent> timeline = new List<TimelineEvent>();
        
        try {
            // Arr, fetch the case creation event first
            Case caseRecord = [SELECT Id, CreatedDate, CreatedBy.Name FROM Case WHERE Id = :caseId LIMIT 1];
            timeline.add(new TimelineEvent(
                caseRecord.Id + '_created',
                'Created',
                'Case Created',
                'Created by ' + caseRecord.CreatedBy.Name,
                null,
                caseRecord.CreatedDate
            ));
            
            // Shiver me timbers! Fetch case history (field changes)
            for (CaseHistory history : [
                SELECT Id, Field, OldValue, NewValue, CreatedDate, CreatedBy.Name
                FROM CaseHistory
                WHERE CaseId = :caseId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ]) {
                String eventType = (history.Field == 'Status') ? 'StatusChange' : 'FieldChange';
                String title = getFieldLabel(history.Field) + ' Changed';
                String description = 'Changed by ' + history.CreatedBy.Name;
                String details = formatHistoryDetails(history.Field, history.OldValue, history.NewValue);
                
                timeline.add(new TimelineEvent(
                    history.Id,
                    eventType,
                    title,
                    description,
                    details,
                    history.CreatedDate
                ));
            }
            
            // Here be the case comments sailing in
            for (CaseComment comment : [
                SELECT Id, CommentBody, CreatedDate, CreatedBy.Name
                FROM CaseComment
                WHERE ParentId = :caseId
                ORDER BY CreatedDate DESC
                LIMIT 50
            ]) {
                timeline.add(new TimelineEvent(
                    comment.Id,
                    'Comment',
                    'Comment Added',
                    'By ' + comment.CreatedBy.Name,
                    truncateText(comment.CommentBody, 200),
                    comment.CreatedDate
                ));
            }
            
            // Avast! Fetch related tasks and events
            for (Task task : [
                SELECT Id, Subject, Status, ActivityDate, CreatedDate, Owner.Name
                FROM Task
                WHERE WhatId = :caseId
                ORDER BY CreatedDate DESC
                LIMIT 50
            ]) {
                timeline.add(new TimelineEvent(
                    task.Id,
                    'Task',
                    task.Subject,
                    'Owner: ' + task.Owner.Name,
                    'Status: ' + task.Status,
                    task.CreatedDate
                ));
            }
            
        } catch (Exception e) {
            // If this value be null, we log the error and return empty seas
            System.debug('Error fetching timeline data: ' + e.getMessage());
            throw new AuraHandledException('Error loading timeline: ' + e.getMessage());
        }
        
        return timeline;
    }
    
    /**
     * Helper method to get friendly field labels, lest we confuse the crew
     */
    private static String getFieldLabel(String fieldName) {
        Map<String, String> labelMap = new Map<String, String>{
            'Status' => 'Status',
            'Priority' => 'Priority',
            'OwnerId' => 'Owner',
            'Subject' => 'Subject',
            'Origin' => 'Origin',
            'Type' => 'Type'
        };
        return labelMap.containsKey(fieldName) ? labelMap.get(fieldName) : fieldName;
    }
    
    /**
     * Format history details showing the old and new values
     */
    private static String formatHistoryDetails(String field, Object oldValue, Object newValue) {
        String oldStr = (oldValue != null) ? String.valueOf(oldValue) : '(none)';
        String newStr = (newValue != null) ? String.valueOf(newValue) : '(none)';
        return oldStr + ' → ' + newStr;
    }
    
    /**
     * Truncate text to a maximum length, like trimming the sails
     */
    private static String truncateText(String text, Integer maxLength) {
        if (String.isBlank(text) || text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Wrapper class for timeline events - our treasure map data structure
     */
    public class TimelineEvent {
        @AuraEnabled public String id;
        @AuraEnabled public String eventType;
        @AuraEnabled public String title;
        @AuraEnabled public String description;
        @AuraEnabled public String details;
        @AuraEnabled public DateTime eventDate;
        
        public TimelineEvent(String id, String eventType, String title, String description, String details, DateTime eventDate) {
            this.id = id;
            this.eventType = eventType;
            this.title = title;
            this.description = description;
            this.details = details;
            this.eventDate = eventDate;
        }
    }
}