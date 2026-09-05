import { LightningElement, api, wire } from 'lwc';
import getCaseTimeline from '@salesforce/apex/CaseTimelineController.getCaseTimeline';

export default class CaseTimeline extends LightningElement {
    @api recordId; // Arr! This be the Case ID from the record page
    
    timelineItems = [];
    error;
    isLoading = true;

    // Wire the Apex method to fetch timeline events when component loads
    @wire(getCaseTimeline, { caseId: '$recordId' })
    wiredTimeline({ error, data }) {
        this.isLoading = false;
        if (data) {
            // Shiver me timbers! We've got our timeline treasure
            this.timelineItems = data;
            this.error = undefined;
        } else if (error) {
            // Blimey! The seas be rough today
            this.error = error;
            this.timelineItems = [];
        }
    }

    get hasTimelineItems() {
        return this.timelineItems && this.timelineItems.length > 0;
    }

    get noItemsMessage() {
        // Calm waters - no events to report yet
        return 'No timeline events found for this case.';
    }

    // Arr! This method determines what icon to show based on event type
    getIconName(item) {
        const iconMap = {
            'Created': 'standard:announcement',
            'Status Change': 'standard:service_crew',
            'Comment': 'standard:post',
            'Field Update': 'standard:edit',
            'Closed': 'standard:approval'
        };
        return iconMap[item.eventType] || 'standard:record';
    }

    // Format the date like a proper ship's log entry
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}