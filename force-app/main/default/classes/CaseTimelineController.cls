/**
 * Arr, this be the Apex controller fer the Case Timeline component
 * It fetches all the events and activities related to a Case, organized like a ship's manifest
 */
public with sharing class CaseTimelineController {
    
    /**
     * Get timeline events fer a specific Case
     * @param caseId The Id of the Case record
     * @return List of timeline items, ready to be displayed
     */
    @AuraEnabled(cacheable=true)
    public static List<TimelineItem> getCaseTimeline(Id caseId) {
        List<TimelineItem> timeline = new List<TimelineItem>();
        
        if (caseId == null) {
            // Blimey! No case ID provided - abandon ship early
            return timeline;
        }
        
        try {
            // Fetch the Case record itself - the flagship of our fleet
            Case caseRecord = [SELECT Id, CaseNumber, Status, CreatedDate, ClosedDate, 
                                     CreatedBy.Name, Owner.Name, Subject, Description
                              FROM Case 
                              WHERE Id = :caseId 
                              LIMIT 1];
            
            // Add Case Created event - the moment the ship set sail
            TimelineItem createdItem = new TimelineItem();
            createdItem.Id = caseId + '-created';
            createdItem.Title__c = 'Case Created: ' + caseRecord.CaseNumber;
            createdItem.Description__c = caseRecord.Subject;
            createdItem.ActivityDate__c = caseRecord.CreatedDate;
            createdItem.EventType__c = 'Created';
            createdItem.CreatedBy = caseRecord.CreatedBy;
            timeline.add(createdItem);
            
            // Fetch Case History - all the status changes and modifications, like entries in the captain's log
            List<CaseHistory> histories = [SELECT Id, Field, OldValue, NewValue, CreatedDate, CreatedBy.Name
                                          FROM CaseHistory
                                          WHERE CaseId = :caseId
                                          AND Field IN ('Status', 'Owner', 'Priority')
                                          ORDER BY CreatedDate DESC
                                          LIMIT 100];
            
            // Transform history records into timeline items
            for (CaseHistory history : histories) {
                TimelineItem historyItem = new TimelineItem();
                historyItem.Id = history.Id;
                historyItem.Title__c = getHistoryTitle(history);
                historyItem.Description__c = getHistoryDescription(history);
                historyItem.ActivityDate__c = history.CreatedDate;
                historyItem.EventType__c = getHistoryEventType(history);
                historyItem.CreatedBy = new User(Name = history.CreatedBy.Name);
                timeline.add(historyItem);
            }
            
            // Fetch Email Messages - correspondence with landlubbers and fellow pirates
            List<EmailMessage> emails = [SELECT Id, Subject, TextBody, CreatedDate, CreatedBy.Name, Incoming
                                        FROM EmailMessage
                                        WHERE ParentId = :caseId
                                        ORDER BY CreatedDate DESC
                                        LIMIT 50];
            
            for (EmailMessage email : emails) {
                TimelineItem emailItem = new TimelineItem();
                emailItem.Id = email.Id;
                emailItem.Title__c = (email.Incoming ? 'Received: ' : 'Sent: ') + email.Subject;
                emailItem.Description__c = truncateText(email.TextBody, 200);
                emailItem.ActivityDate__c = email.CreatedDate;
                emailItem.EventType__c = 'Comment';
                emailItem.CreatedBy = new User(Name = email.CreatedBy.Name);
                timeline.add(emailItem);
            }
            
            // If the Case be closed, add a Closed event - the ship has reached port
            if (caseRecord.ClosedDate != null) {
                TimelineItem closedItem = new TimelineItem();
                closedItem.Id = caseId + '-closed';
                closedItem.Title__c = 'Case Closed';
                closedItem.Description__c = 'Status: ' + caseRecord.Status;
                closedItem.ActivityDate__c = caseRecord.ClosedDate;
                closedItem.EventType__c = 'Closed';
                timeline.add(closedItem);
            }
            
        } catch (Exception e) {
            // Shiver me timbers! Log the error and return an empty list
            System.debug('Error fetching case timeline: ' + e.getMessage());
            throw new AuraHandledException('Error loading timeline: ' + e.getMessage());
        }
        
        return timeline;
    }
    
    /**
     * Helper method to generate a readable title fer history records
     */
    private static String getHistoryTitle(CaseHistory history) {
        String field = history.Field;
        String oldVal = String.valueOf(history.OldValue);
        String newVal = String.valueOf(history.NewValue);
        
        return field + ' changed from "' + oldVal + '" to "' + newVal + '"';
    }
    
    /**
     * Helper method to get description fer history records
     */
    private static String getHistoryDescription(CaseHistory history) {
        return 'Field updated: ' + history.Field;
    }
    
    /**
     * Determine the event type based on the history field
     */
    private static String getHistoryEventType(CaseHistory history) {
        if (history.Field == 'Status') {
            return 'Status_Change';
        } else if (history.Field == 'Owner') {
            return 'Assigned';
        } else if (history.Field == 'Priority') {
            return 'Escalated';
        }
        return 'Status_Change';
    }
    
    /**
     * Truncate long text to keep the timeline tidy - we don't need the whole sea shanty
     */
    private static String truncateText(String text, Integer maxLength) {
        if (String.isBlank(text)) {
            return '';
        }
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Wrapper class fer timeline items - like a treasure chest fer data
     */
    public class TimelineItem {
        @AuraEnabled public String Id { get; set; }
        @AuraEnabled public String Title__c { get; set; }
        @AuraEnabled public String Description__c { get; set; }
        @AuraEnabled public DateTime ActivityDate__c { get; set; }
        @AuraEnabled public String EventType__c { get; set; }
        @AuraEnabled public User CreatedBy { get; set; }
    }
}