/**
 * Arr! This be the controller that fetches timeline events for a Case
 * Ye can use this to display a chronological view of what happened to a case
 */
public with sharing class CaseTimelineController {
    
    /**
     * Shiver me timbers! Fetch all timeline events for a given Case
     * @param caseId The ID of the Case record
     * @return List of timeline items sorted by date (newest first)
     */
    @AuraEnabled(cacheable=true)
    public static List<TimelineItem> getCaseTimeline(Id caseId) {
        List<TimelineItem> timelineItems = new List<TimelineItem>();
        
        try {
            // Arr! First, let's get the Case itself to show creation
            Case caseRecord = [SELECT Id, CaseNumber, CreatedDate, CreatedBy.Name, Status, Subject 
                              FROM Case 
                              WHERE Id = :caseId 
                              LIMIT 1];
            
            // Add the case creation event - the beginning of the voyage!
            timelineItems.add(new TimelineItem(
                'created_' + caseRecord.Id,
                'Created',
                'Case Created: ' + caseRecord.CaseNumber,
                caseRecord.Subject,
                caseRecord.CreatedDate,
                caseRecord.CreatedBy.Name,
                'standard:announcement'
            ));
            
            // Blimey! Now fetch the Case History to track field changes
            List<CaseHistory> historyRecords = [SELECT Id, Field, OldValue, NewValue, CreatedDate, CreatedBy.Name
                                               FROM CaseHistory 
                                               WHERE CaseId = :caseId 
                                               ORDER BY CreatedDate DESC
                                               LIMIT 100];
            
            // Sail through each history record and add it to the timeline
            for (CaseHistory history : historyRecords) {
                String eventType = 'Field Update';
                String iconName = 'standard:edit';
                String title = String.valueOf(history.Field) + ' Changed';
                String description = 'From: ' + (history.OldValue != null ? String.valueOf(history.OldValue) : 'None') + 
                                   ' → To: ' + (history.NewValue != null ? String.valueOf(history.NewValue) : 'None');
                
                // Special handling for Status changes - they be important milestones!
                if (history.Field == 'Status') {
                    eventType = 'Status Change';
                    iconName = 'standard:service_crew';
                    title = 'Status: ' + (history.NewValue != null ? String.valueOf(history.NewValue) : 'Updated');
                    
                    // If closed, mark it special like finding buried treasure!
                    if (String.valueOf(history.NewValue).toLowerCase().contains('closed')) {
                        eventType = 'Closed';
                        iconName = 'standard:approval';
                    }
                }
                
                timelineItems.add(new TimelineItem(
                    'history_' + history.Id,
                    eventType,
                    title,
                    description,
                    history.CreatedDate,
                    history.CreatedBy.Name,
                    iconName
                ));
            }
            
            // Arr! Fetch feed items (posts/comments) for additional context
            List<FeedItem> feedItems = [SELECT Id, Body, CreatedDate, CreatedBy.Name, Type
                                       FROM FeedItem 
                                       WHERE ParentId = :caseId 
                                       AND Type IN ('TextPost', 'ContentPost')
                                       ORDER BY CreatedDate DESC
                                       LIMIT 50];
            
            // Add feed comments to the timeline - the crew's messages!
            for (FeedItem feed : feedItems) {
                if (feed.Body != null && feed.Body.length() > 0) {
                    timelineItems.add(new TimelineItem(
                        'feed_' + feed.Id,
                        'Comment',
                        'Comment Added',
                        feed.Body,
                        feed.CreatedDate,
                        feed.CreatedBy.Name,
                        'standard:post'
                    ));
                }
            }
            
            // Sort all events by date - newest at the top of the crow's nest!
            timelineItems.sort();
            
        } catch (Exception e) {
            // Blimey! We've encountered a kraken (error)
            throw new AuraHandledException('Error fetching timeline: ' + e.getMessage());
        }
        
        return timelineItems;
    }
    
    /**
     * Arr! This be the wrapper class for timeline items
     * Keeps all our event data organized like a proper ship's manifest
     */
    public class TimelineItem implements Comparable {
        @AuraEnabled public String id;
        @AuraEnabled public String eventType;
        @AuraEnabled public String title;
        @AuraEnabled public String description;
        @AuraEnabled public DateTime eventDate;
        @AuraEnabled public String createdBy;
        @AuraEnabled public String iconName;
        
        public TimelineItem(String id, String eventType, String title, String description, 
                           DateTime eventDate, String createdBy, String iconName) {
            this.id = id;
            this.eventType = eventType;
            this.title = title;
            this.description = description;
            this.eventDate = eventDate;
            this.createdBy = createdBy;
            this.iconName = iconName;
        }
        
        // Compare method to sort by date (newest first) - like organizing the ship's log!
        public Integer compareTo(Object compareTo) {
            TimelineItem compareItem = (TimelineItem)compareTo;
            if (eventDate == compareItem.eventDate) return 0;
            if (eventDate > compareItem.eventDate) return -1;
            return 1;
        }
    }
}