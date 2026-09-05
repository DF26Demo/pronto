/**
 * Arr, this be the Apex controller fer the case timeline component!
 * It fetches all the events related to a case record, like a ship's log.
 * Blimey! Here be where the magic happens on the server side.
 */
public with sharing class CaseTimelineController {
  /**
   * Hoist the anchor! Fetch all timeline events fer a given case.
   * @param caseId - The ID of the case record
   * @return List of timeline events sorted by creation date
   */
  @AuraEnabled(cacheable=true)
  public static List<TimelineEvent> getCaseTimeline(Id caseId) {
    List<TimelineEvent> events = new List<TimelineEvent>();

    // Blimey! First, get the case creation event
    List<Case> cases = [
      SELECT Id, Subject, Status, CreatedDate, CreatedById, CreatedBy.Name, Description
      FROM Case
      WHERE Id = :caseId
    ];

    if (cases.isEmpty()) {
      return events; // Walk the plank, no case found!
    }

    Case caseRecord = cases[0];

    // The case be created like a ship launched from port
    events.add(
      new TimelineEvent(
        caseRecord.Id + '_created',
        'Case Created',
        'Case "' + caseRecord.Subject + '" was created',
        caseRecord.CreatedDate,
        caseRecord.CreatedBy.Name,
        'created',
        caseRecord.Status
      )
    );

    // Arr, fetch case field history - like reading the ship's logs
    List<CaseHistory> histories = [
      SELECT Id, CaseId, CreatedDate, CreatedById, Field, OldValue, NewValue, CreatedBy.Name
      FROM CaseHistory
      WHERE CaseId = :caseId
      ORDER BY CreatedDate DESC
    ];

    // Transform the history records into timeline events
    for (CaseHistory history : histories) {
      String eventType = 'case_updated'; // Default event type
      String description = 'Updated ' + history.Field; // The description be generic

      // Customize the description fer common fields
      if (history.Field == 'Status') {
        eventType = 'status_changed';
        description = 'Status changed from "' + history.OldValue + '" to "' + history.NewValue + '"';
      } else if (history.Field == 'Subject') {
        description = 'Subject changed to "' + history.NewValue + '"';
      } else if (history.Field == 'Description') {
        description = 'Description was updated';
      }

      events.add(
        new TimelineEvent(
          history.Id,
          history.Field + ' Updated',
          description,
          history.CreatedDate,
          history.CreatedBy.Name,
          eventType,
          history.NewValue != null ? String.valueOf(history.NewValue) : String.valueOf(history.OldValue)
        )
      );
    }

    // Fetch comments from the case - the crew's chatter about the voyage
    List<CaseComment> comments = [
      SELECT Id, CaseId, CreatedDate, CreatedBy.Name, CommentBody
      FROM CaseComment
      WHERE CaseId = :caseId
      ORDER BY CreatedDate DESC
    ];

    for (CaseComment comment : comments) {
      events.add(
        new TimelineEvent(
          comment.Id,
          'Comment Added',
          comment.CommentBody,
          comment.CreatedDate,
          comment.CreatedBy.Name,
          'comment_added',
          null
        )
      );
    }

    // Hoist the mainsail! Sort events by creation date (newest first)
    events.sort((a, b) => b.createdDate.compareTo(a.createdDate));

    return events;
  }

  /**
   * Blimey! This inner class be the timeline event model.
   * It represents a single event in the case's voyage across the seas.
   */
  public class TimelineEvent {
    @AuraEnabled
    public String id;

    @AuraEnabled
    public String title;

    @AuraEnabled
    public String description;

    @AuraEnabled
    public DateTime createdDate;

    @AuraEnabled
    public String createdBy;

    @AuraEnabled
    public String eventType;

    @AuraEnabled
    public String details;

    /**
     * Arr, the constructor fer a timeline event.
     * Every event has a story to tell on the high seas!
     */
    public TimelineEvent(String id, String title, String description, DateTime createdDate, String createdBy, String eventType, String details) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.createdDate = createdDate;
      this.createdBy = createdBy;
      this.eventType = eventType;
      this.details = details;
    }
  }
}
