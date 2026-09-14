import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getAccountActivities from '@salesforce/apex/AccountTimelineController.getAccountActivities';

// Arr, this be the main timeline component for Account records
export default class AccountTimeline extends LightningElement {
    @api recordId; // Blimey! This be the Account Id we're chartin'
    activities = [];
    error;
    isLoading = true;

    // Here be dragons — we fetch all activities when the component loads
    connectedCallback() {
        this.loadActivities();
    }

    // This function sails forth to fetch activities from the server
    loadActivities() {
        this.isLoading = true;
        getAccountActivities({ accountId: this.recordId })
            .then(result => {
                // Arr, we've found treasure! Sort 'em by date, newest first
                this.activities = result.map(activity => {
                    return {
                        ...activity,
                        // Parse the date like a proper navigator
                        displayDate: this.formatDate(activity.activityDate),
                        iconName: this.getIconName(activity.type),
                        iconVariant: this.getIconVariant(activity.status)
                    };
                }).sort((a, b) => new Date(b.activityDate) - new Date(a.activityDate));
                this.error = undefined;
            })
            .catch(error => {
                // Shiver me timbers! Something went wrong
                this.error = error;
                this.activities = [];
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Format dates in a way even a landlubber can understand
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    }

    // Pick the right icon based on activity type, like choosin' the right flag
    getIconName(type) {
        const iconMap = {
            'Task': 'standard:task',
            'Event': 'standard:event',
            'Call': 'standard:log_a_call',
            'Email': 'standard:email'
        };
        return iconMap[type] || 'standard:task';
    }

    // Set the icon variant based on status — green for done, red for overdue
    getIconVariant(status) {
        if (status === 'Completed') return 'success';
        if (status === 'Overdue') return 'error';
        return 'warning';
    }

    // Check if we have any activities to show
    get hasActivities() {
        return this.activities && this.activities.length > 0;
    }
}