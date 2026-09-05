import { LightningElement, api, wire } from 'lwc';
import getTimelineData from '@salesforce/apex/CaseTimelineController.getTimelineData';
import { refreshApex } from '@salesforce/apex';

export default class CaseTimeline extends LightningElement {
    @api recordId; // Arr! This be the Case ID from the record page
    
    timelineItems = [];
    error;
    wiredTimelineResult;

    // Wire the Apex method to fetch timeline data when component loads
    @wire(getTimelineData, { caseId: '$recordId' })
    wiredTimeline(result) {
        this.wiredTimelineResult = result;
        const { error, data } = result;
        
        if (data) {
            // Shiver me timbers! Transform and sort the timeline data
            this.timelineItems = this.processTimelineData(data);
            this.error = undefined;
        } else if (error) {
            // Blimey! We've encountered an error on the high seas
            this.error = error;
            this.timelineItems = [];
        }
    }

    // Arr! Process the timeline data and sort it like a skilled navigator
    processTimelineData(data) {
        let items = [];

        // Process case history - field changes be important treasures!
        if (data.caseHistory) {
            data.caseHistory.forEach(history => {
                items.push({
                    id: history.Id,
                    type: 'field-change',
                    icon: 'utility:edit',
                    title: `${history.Field} Changed`,
                    description: `${history.OldValue || '(blank)'} → ${history.NewValue || '(blank)'}`,
                    dateTime: history.CreatedDate,
                    user: history.CreatedBy?.Name || 'Unknown'
                });
            });
        }

        // Process tasks - these be the crew's assignments!
        if (data.tasks) {
            data.tasks.forEach(task => {
                items.push({
                    id: task.Id,
                    type: 'task',
                    icon: task.Status === 'Completed' ? 'utility:check' : 'utility:task',
                    title: task.Subject,
                    description: `Status: ${task.Status} | Priority: ${task.Priority || 'None'}`,
                    dateTime: task.CreatedDate,
                    user: task.Owner?.Name || 'Unknown'
                });
            });
        }

        // Process email messages - communications from the fleet!
        if (data.emailMessages) {
            data.emailMessages.forEach(email => {
                items.push({
                    id: email.Id,
                    type: 'email',
                    icon: 'utility:email',
                    title: email.Subject || '(No Subject)',
                    description: `${email.Incoming ? 'Received from' : 'Sent to'}: ${email.ToAddress || email.FromAddress}`,
                    dateTime: email.CreatedDate,
                    user: email.CreatedBy?.Name || 'System'
                });
            });
        }

        // Sort by date descending - newest treasure on top!
        return items.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    }

    get hasTimelineItems() {
        return this.timelineItems && this.timelineItems.length > 0;
    }

    // Handle refresh button click - reload the treasure map!
    handleRefresh() {
        return refreshApex(this.wiredTimelineResult);
    }

    // Format date for display - make it readable for the crew
    getFormattedDate(dateTime) {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}