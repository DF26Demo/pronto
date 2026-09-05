public with sharing class CaseTimelineController {
    
    /**
     * Arr! This wrapper class holds all the timeline data we be collectin'
     */
    public class TimelineData {
        @AuraEnabled public List<CaseHistory> caseHistory;
        @AuraEnabled public List<Task> tasks;
        @AuraEnabled public List<EmailMessage> emailMessages;
        
        public TimelineData() {
            this.caseHistory = new List<CaseHistory>();
            this.tasks = new List<Task>();
            this.emailMessages = new List<EmailMessage>();
        }
    }
    
    /**
     * Blimey! This method fetches all timeline data for a case
     * @param caseId The ID of the case we're chartin' the course for
     * @return TimelineData wrapper with history, tasks, and emails
     */
    @AuraEnabled(cacheable=true)
    public static TimelineData getTimelineData(Id caseId) {
        if (caseId == null) {
            throw new AuraHandledException('Shiver me timbers! No Case ID provided.');
        }
        
        TimelineData timeline = new TimelineData();
        
        try {
            // Fetch case history - track the journey of this case through troubled waters
            timeline.caseHistory = [
                SELECT Id, Field, OldValue, NewValue, CreatedDate, CreatedBy.Name
                FROM CaseHistory
                WHERE CaseId = :caseId
                ORDER BY CreatedDate DESC
                LIMIT 200
            ];
            
            // Fetch related tasks - the crew's assignments!
            timeline.tasks = [
                SELECT Id, Subject, Status, Priority, CreatedDate, Owner.Name
                FROM Task
                WHERE WhatId = :caseId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ];
            
            // Fetch email messages - communications with landlubbers and crew alike
            timeline.emailMessages = [
                SELECT Id, Subject, ToAddress, FromAddress, Incoming, CreatedDate, CreatedBy.Name
                FROM EmailMessage
                WHERE ParentId = :caseId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ];
            
        } catch (Exception e) {
            // If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch timeline data: ' + e.getMessage());
        }
        
        return timeline;
    }
}