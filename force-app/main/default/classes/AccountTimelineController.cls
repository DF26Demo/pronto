/**
 * Arr, this be the Apex controller that fetches activities from the seven seas (database)
 * It retrieves Tasks and Events related to an Account and returns 'em as timeline data
 */
public with sharing class AccountTimelineController {
    
    /**
     * Fetch all activities for a given Account — like readin' the ship's log
     * @param accountId The Id of the Account we're investigatin'
     * @return List of activity data wrapped in our custom wrapper class
     */
    @AuraEnabled(cacheable=true)
    public static List<ActivityWrapper> getAccountActivities(Id accountId) {
        List<ActivityWrapper> activities = new List<ActivityWrapper>();
        
        // Blimey! First we fetch all the Tasks for this Account
        List<Task> tasks = [
            SELECT Id, Subject, ActivityDate, Status, Description, Type
            FROM Task 
            WHERE WhatId = :accountId
            ORDER BY ActivityDate DESC NULLS LAST
            LIMIT 100
        ];
        
        // Add each Task to our treasure chest of activities
        for (Task t : tasks) {
            ActivityWrapper wrapper = new ActivityWrapper();
            wrapper.id = t.Id;
            wrapper.subject = t.Subject;
            wrapper.activityDate = t.ActivityDate != null ? Datetime.newInstance(t.ActivityDate.year(), t.ActivityDate.month(), t.ActivityDate.day()) : null;
            wrapper.status = t.Status;
            wrapper.description = t.Description;
            wrapper.type = String.isNotBlank(t.Type) ? t.Type : 'Task';
            activities.add(wrapper);
        }
        
        // Now fetch all the Events — the scheduled rendezvous on the calendar
        List<Event> events = [
            SELECT Id, Subject, ActivityDate, StartDateTime, EndDateTime, Description, Type
            FROM Event 
            WHERE WhatId = :accountId
            ORDER BY ActivityDate DESC NULLS LAST
            LIMIT 100
        ];
        
        // Add each Event to our collection
        for (Event e : events) {
            ActivityWrapper wrapper = new ActivityWrapper();
            wrapper.id = e.Id;
            wrapper.subject = e.Subject;
            wrapper.activityDate = e.StartDateTime;
            wrapper.status = 'Scheduled';
            wrapper.description = e.Description;
            wrapper.type = String.isNotBlank(e.Type) ? e.Type : 'Event';
            activities.add(wrapper);
        }
        
        // Return the full bounty of activities
        return activities;
    }
    
    /**
     * Wrapper class to hold activity data in a format fit for the frontend crew
     */
    public class ActivityWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String subject;
        @AuraEnabled public Datetime activityDate;
        @AuraEnabled public String status;
        @AuraEnabled public String description;
        @AuraEnabled public String type;
    }
}