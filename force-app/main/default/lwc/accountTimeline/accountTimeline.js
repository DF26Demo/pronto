import { LightningElement, api, wire } from 'lwc';
import getTimelineEvents from '@salesforce/apex/AccountTimelineController.getTimelineEvents';

export default class AccountTimeline extends LightningElement {
    @api recordId; // Arr! This be automatically set to the Account ID when on a record page
    
    timelineEvents = [];
    error;

    // Wire the Apex method to fetch timeline events when component loads
    @wire(getTimelineEvents, { accountId: '$recordId' })
    wiredEvents({ error, data }) {
        if (data) {
            // Shiver me timbers! Transform the data into timeline events
            this.timelineEvents = this.transformEvents(data);
            this.error = undefined;
        } else if (error) {
            // Blimey! We've encountered stormy seas
            this.error = error.body?.message || 'Unknown error occurred';
            this.timelineEvents = [];
        }
    }

    get hasEvents() {
        return this.timelineEvents && this.timelineEvents.length > 0;
    }

    /**
     * Arr! This method transforms raw event data into timeline-ready treasures
     * Each event gets an icon, color, and formatted details
     */
    transformEvents(events) {
        if (!events) return [];

        return events.map(event => {
            let icon, iconContainerClass, description;

            // Determine the icon and styling based on event type
            switch(event.eventType) {
                case 'Case Created':
                    icon = 'standard:case';
                    iconContainerClass = 'slds-icon_container slds-icon-standard-case';
                    description = `Case #${event.recordNumber} was created`;
                    break;
                case 'Case Closed':
                    icon = 'standard:case';
                    iconContainerClass = 'slds-icon_container slds-icon-standard-case';
                    description = `Case #${event.recordNumber} was closed`;
                    break;
                case 'Opportunity Created':
                    icon = 'standard:opportunity';
                    iconContainerClass = 'slds-icon_container slds-icon-standard-opportunity';
                    description = `Opportunity "${event.title}" was created`;
                    break;
                case 'Opportunity Stage Changed':
                    icon = 'standard:opportunity';
                    iconContainerClass = 'slds-icon_container slds-icon-standard-opportunity';
                    description = `Stage changed to ${event.additionalInfo}`;
                    break;
                case 'Task Completed':
                    icon = 'standard:task';
                    iconContainerClass = 'slds-icon_container slds-icon-standard-task';
                    description = event.additionalInfo;
                    break;
                case 'Event Completed':
                    icon = 'standard:event';
                    iconContainerClass = 'slds-icon_container slds-icon-standard-event';
                    description = event.additionalInfo;
                    break;
                default:
                    icon = 'standard:record';
                    iconContainerClass = 'slds-icon_container slds-icon-standard-record';
                    description = event.additionalInfo || '';
            }

            return {
                id: event.id,
                title: event.title,
                type: event.eventType,
                date: event.eventDate,
                icon: icon,
                iconContainerClass: iconContainerClass,
                description: description
            };
        });
    }
}