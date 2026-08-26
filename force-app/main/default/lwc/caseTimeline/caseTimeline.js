import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getTimelineData from '@salesforce/apex/CaseTimelineController.getTimelineData';

export default class CaseTimeline extends LightningElement {
    @api recordId;
    timelineItems = [];
    isLoading = true;
    error;

    // Arr, this wires up the case record so we know when to reload
    @wire(getRecord, { recordId: '$recordId', fields: ['Case.Id'] })
    caseRecord;

    connectedCallback() {
        this.loadTimelineData();
    }

    // Blimey! This function fetches the timeline treasure from the server
    loadTimelineData() {
        this.isLoading = true;
        getTimelineData({ caseId: this.recordId })
            .then(result => {
                // Here be dragons — we transform the data into timeline items
                this.timelineItems = this.processTimelineData(result);
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error;
                this.isLoading = false;
                console.error('Error loading timeline data:', error);
            });
    }

    // Ahoy! This method processes raw data into display-ready timeline items
    processTimelineData(data) {
        if (!data || data.length === 0) {
            return [];
        }

        // Sort by date descending (newest first, like fresh catch from the sea)
        return data.map(item => {
            return {
                id: item.id,
                type: item.eventType,
                title: item.title,
                description: item.description,
                details: item.details,
                formattedDate: this.formatDate(item.eventDate),
                iconName: this.getIconName(item.eventType),
                iconContainerClass: this.getIconClass(item.eventType)
            };
        }).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    }

    // Avast! Pick the right icon based on event type
    getIconName(eventType) {
        const iconMap = {
            'FieldChange': 'utility:edit',
            'Comment': 'utility:comments',
            'StatusChange': 'utility:change_record_type',
            'Email': 'utility:email',
            'Call': 'utility:call',
            'Task': 'utility:task',
            'Created': 'utility:new'
        };
        return iconMap[eventType] || 'utility:record';
    }

    // Shiver me timbers! Style each icon container based on type
    getIconClass(eventType) {
        const baseClass = 'slds-icon_container slds-timeline__icon';
        const typeMap = {
            'FieldChange': 'slds-icon-standard-record',
            'Comment': 'slds-icon-standard-post',
            'StatusChange': 'slds-icon-standard-approval',
            'Email': 'slds-icon-standard-email',
            'Call': 'slds-icon-standard-call',
            'Task': 'slds-icon-standard-task',
            'Created': 'slds-icon-standard-case'
        };
        return `${baseClass} ${typeMap[eventType] || 'slds-icon-standard-record'}`;
    }

    // Format dates like a proper ship's log entry
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // Return relative time like "2 hours ago" or "3 days ago"
        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
    }

    get hasTimelineItems() {
        return !this.isLoading && this.timelineItems && this.timelineItems.length > 0;
    }

    get noTimelineItems() {
        return !this.isLoading && (!this.timelineItems || this.timelineItems.length === 0);
    }
}