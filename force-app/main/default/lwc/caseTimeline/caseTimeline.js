import { LightningElement, api, wire } from 'lwc';
import getCaseTimeline from '@salesforce/apex/CaseTimelineController.getCaseTimeline';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = ['Case.Status', 'Case.CreatedDate', 'Case.ClosedDate'];

export default class CaseTimeline extends LightningElement {
    @api recordId; // Arr, this be the Case ID from the record page
    timelineItems = [];
    isLoading = true;
    error;

    // Ahoy! Wire up the Case record to watch for changes like a lookout in the crow's nest
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    caseRecord;

    // Fetch the timeline data from Apex - this be where the magic happens
    @wire(getCaseTimeline, { caseId: '$recordId' })
    wiredTimeline({ error, data }) {
        if (data) {
            // Blimey! Transform the data into a format fit for display
            this.timelineItems = this.transformTimelineData(data);
            this.isLoading = false;
            this.error = undefined;
        } else if (error) {
            // Shiver me timbers! Something went wrong
            this.error = error;
            this.timelineItems = [];
            this.isLoading = false;
            console.error('Error loading timeline:', error);
        }
    }

    // Here be dragons - transform raw data into timeline items
    transformTimelineData(data) {
        if (!data || data.length === 0) {
            return [];
        }

        // Sort by date, newest first - like organizing treasure by date discovered
        return data.map((item, index) => {
            return {
                id: item.Id || `timeline-${index}`,
                title: item.Title__c || item.Subject || 'Event',
                description: item.Description__c || item.Description || '',
                dateFormatted: this.formatDate(item.ActivityDate__c || item.CreatedDate),
                user: item.CreatedBy ? item.CreatedBy.Name : '',
                iconName: this.getIconForEventType(item.EventType__c),
                iconContainerClass: this.getIconContainerClass(item.EventType__c)
            };
        }).sort((a, b) => {
            // Newest events sail to the top
            return new Date(b.dateFormatted) - new Date(a.dateFormatted);
        });
    }

    // Format dates in a way that's easy on the eyes, matey
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Assign icons based on event type - every ship needs its flag!
    getIconForEventType(eventType) {
        const iconMap = {
            'Created': 'standard:case',
            'Status_Change': 'standard:flow',
            'Comment': 'standard:email',
            'Closed': 'standard:approval',
            'Escalated': 'standard:priority',
            'Assigned': 'standard:people'
        };
        return iconMap[eventType] || 'standard:record';
    }

    // Color code the icons - make 'em pop like a parrot on yer shoulder
    getIconContainerClass(eventType) {
        const baseClass = 'timeline-icon-container';
        const typeClass = eventType ? `icon-${eventType.toLowerCase()}` : 'icon-default';
        return `${baseClass} ${typeClass}`;
    }

    // Check if we've got timeline items to show
    get hasTimelineItems() {
        return this.timelineItems && this.timelineItems.length > 0;
    }
}