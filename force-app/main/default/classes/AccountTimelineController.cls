public with sharing class AccountTimelineController {
    /**
     * Arr! This method fetches timeline events for an account
     * We're gatherin' Cases, Opportunities, and Activities like treasure from multiple islands
     * @param accountId The ID of the account we're chartin' a timeline for
     * @return List of TimelineEvent wrapper objects, sorted by date
     */
    @AuraEnabled(cacheable=true)
    public static List<TimelineEvent> getTimelineEvents(Id accountId) {
        List<TimelineEvent> events = new List<TimelineEvent>();
        
        try {
            // Fetch Cases - both when they were created and when they were closed
            for (Case c : [
                SELECT Id, CaseNumber, Subject, CreatedDate, ClosedDate, IsClosed
                FROM Case
                WHERE AccountId = :accountId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ]) {
                // Add case creation event
                events.add(new TimelineEvent(
                    c.Id + '_created',
                    c.Subject,
                    'Case Created',
                    c.CreatedDate,
                    c.CaseNumber,
                    null
                ));
                
                // If the case be closed, add a closure event too
                if (c.IsClosed && c.ClosedDate != null) {
                    events.add(new TimelineEvent(
                        c.Id + '_closed',
                        c.Subject,
                        'Case Closed',
                        c.ClosedDate,
                        c.CaseNumber,
                        null
                    ));
                }
            }
            
            // Fetch Opportunities - track their journey through the sales process
            for (Opportunity opp : [
                SELECT Id, Name, StageName, CreatedDate, CloseDate, IsClosed
                FROM Opportunity
                WHERE AccountId = :accountId
                ORDER BY CreatedDate DESC
                LIMIT 100
            ]) {
                // Add opportunity creation event
                events.add(new TimelineEvent(
                    opp.Id + '_created',
                    opp.Name,
                    'Opportunity Created',
                    opp.CreatedDate,
                    null,
                    'Initial Stage: ' + opp.StageName
                ));
                
                // If closed, add the closing event
                if (opp.IsClosed && opp.CloseDate != null) {
                    events.add(new TimelineEvent(
                        opp.Id + '_stage',
                        opp.Name,
                        'Opportunity Stage Changed',
                        opp.CloseDate,
                        null,
                        opp.StageName
                    ));
                }
            }
            
            // Fetch completed Tasks
            for (Task t : [
                SELECT Id, Subject, ActivityDate, Status
                FROM Task
                WHERE AccountId = :accountId
                AND Status = 'Completed'
                AND ActivityDate != null
                ORDER BY ActivityDate DESC
                LIMIT 50
            ]) {
                events.add(new TimelineEvent(
                    t.Id,
                    t.Subject,
                    'Task Completed',
                    t.ActivityDate,
                    null,
                    'Status: ' + t.Status
                ));
            }
            
            // Fetch completed Events
            for (Event e : [
                SELECT Id, Subject, StartDateTime, EndDateTime
                FROM Event
                WHERE AccountId = :accountId
                AND StartDateTime != null
                ORDER BY StartDateTime DESC
                LIMIT 50
            ]) {
                events.add(new TimelineEvent(
                    e.Id,
                    e.Subject,
                    'Event Completed',
                    e.StartDateTime,
                    null,
                    'Meeting or Event'
                ));
            }
            
            // Sort all events by date, newest first - like sorting a captain's log
            events.sort();
            
            return events;
            
        } catch (Exception e) {
            // If we hit rough seas, throw an error message
            throw new AuraHandledException('Failed to fetch timeline events: ' + e.getMessage());
        }
    }
    
    /**
     * Wrapper class to represent a timeline event
     * This be the treasure map for each event on our timeline
     */
    public class TimelineEvent implements Comparable {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String title { get; set; }
        @AuraEnabled public String eventType { get; set; }
        @AuraEnabled public DateTime eventDate { get; set; }
        @AuraEnabled public String recordNumber { get; set; }
        @AuraEnabled public String additionalInfo { get; set; }
        
        public TimelineEvent(String id, String title, String eventType, DateTime eventDate, String recordNumber, String additionalInfo) {
            this.id = id;
            this.title = title;
            this.eventType = eventType;
            this.eventDate = eventDate;
            this.recordNumber = recordNumber;
            this.additionalInfo = additionalInfo;
        }
        
        // Implement Comparable to sort by date (newest first)
        public Integer compareTo(Object compareTo) {
            TimelineEvent compareToEvent = (TimelineEvent) compareTo;
            if (eventDate == compareToEvent.eventDate) return 0;
            if (eventDate > compareToEvent.eventDate) return -1;
            return 1;
        }
    }
}