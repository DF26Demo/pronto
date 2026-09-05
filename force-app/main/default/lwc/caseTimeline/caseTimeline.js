import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getCaseTimeline from '@salesforce/apex/CaseTimelineController.getCaseTimeline';

// Arr, this be the constants fer our timeline component
const CASE_FIELDS = ['Case.Id', 'Case.Subject', 'Case.Status'];
const EVENT_TYPES = {
  CREATED: 'created',
  STATUS_CHANGED: 'status_changed',
  COMMENT_ADDED: 'comment_added',
  ACTIVITY_LOGGED: 'activity_logged',
  CASE_UPDATED: 'case_updated'
};

export default class CaseTimeline extends LightningElement {
  // Blimey! Here be the record ID from the case record page
  @api recordId;

  caseRecord;
  timelineEvents = [];
  isLoading = true;
  error = null;

  // Wire up the case record data, like hookin' the sails to the mast
  @wire(getRecord, { recordId: '$recordId', fields: CASE_FIELDS })
  caseData({ error, data }) {
    if (data) {
      this.caseRecord = data;
      this.error = null;
      this.fetchTimelineEvents();
    } else if (error) {
      this.error = 'Shiver me timbers! Failed to load case record';
      this.isLoading = false;
    }
  }

  // Navigate the treacherous waters of Apex to fetch timeline events
  fetchTimelineEvents() {
    getCaseTimeline({ caseId: this.recordId })
      .then((result) => {
        // Arr, transform the events into a format the template be needin'
        this.timelineEvents = result.map((event) => ({
          ...event,
          // Hoist the flag fer the event type styling
          iconName: this.getIconForEventType(event.eventType),
          iconClass: this.getClassForEventType(event.eventType),
          formattedDate: this.formatDate(event.createdDate)
        }));
        this.error = null;
        this.isLoading = false;
      })
      .catch((error) => {
        // If Davy Jones comes a-knockin', we handle it here
        console.error('Timeline error:', error);
        this.error = 'Failed to load timeline events. Walk the plank!';
        this.isLoading = false;
      });
  }

  // Blimey! Return the right icon fer each event type
  getIconForEventType(eventType) {
    const iconMap = {
      [EVENT_TYPES.CREATED]: 'standard:case',
      [EVENT_TYPES.STATUS_CHANGED]: 'standard:task',
      [EVENT_TYPES.COMMENT_ADDED]: 'standard:feed',
      [EVENT_TYPES.ACTIVITY_LOGGED]: 'standard:activity',
      [EVENT_TYPES.CASE_UPDATED]: 'standard:record'
    };
    return iconMap[eventType] || 'standard:record';
  }

  // Arr, color-code the events like treasures on a map
  getClassForEventType(eventType) {
    const classMap = {
      [EVENT_TYPES.CREATED]: 'event-created',
      [EVENT_TYPES.STATUS_CHANGED]: 'event-status',
      [EVENT_TYPES.COMMENT_ADDED]: 'event-comment',
      [EVENT_TYPES.ACTIVITY_LOGGED]: 'event-activity',
      [EVENT_TYPES.CASE_UPDATED]: 'event-updated'
    };
    return classMap[eventType] || 'event-default';
  }

  // Format the date like a proper sea captain reads his calendar
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  }
}
