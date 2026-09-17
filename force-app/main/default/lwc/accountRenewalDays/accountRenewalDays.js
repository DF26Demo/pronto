import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import RENEWAL_DATE_FIELD from '@salesforce/schema/Account.Renewal_Date__c';

// Arr! The fields we be needin' from the Account treasure chest
const FIELDS = [RENEWAL_DATE_FIELD];

export default class AccountRenewalDays extends LightningElement {
    @api recordId; // Aye, this be set automatically when on an Account record page
    
    renewalDate;
    error;

    // Wire up the Account data like riggin' the main sail
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            // Hoist the colors! We've got our data
            this.renewalDate = data.fields.Renewal_Date__c.value;
            this.error = undefined;
        } else if (error) {
            // Blimey! Trouble on the horizon
            this.error = error;
            this.renewalDate = null;
        }
    }

    // Calculate days till renewal like countin' doubloons
    get daysUntilRenewal() {
        if (!this.renewalDate) {
            return null;
        }
        
        const today = new Date();
        const renewal = new Date(this.renewalDate);
        
        // Clear the time portion so we only count full days, matey
        today.setHours(0, 0, 0, 0);
        renewal.setHours(0, 0, 0, 0);
        
        // Calculate the difference in days like measurin' nautical miles
        const timeDiff = renewal.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        return daysDiff;
    }

    // Check if we have a valid renewal date
    get hasRenewalDate() {
        return this.renewalDate != null;
    }

    // Determine the message variant based on how many days remain
    get messageVariant() {
        const days = this.daysUntilRenewal;
        if (days < 0) {
            return 'error'; // Shiver me timbers! We've sailed past the deadline
        } else if (days <= 30) {
            return 'warning'; // Batten down the hatches! Renewal be close
        }
        return 'success'; // Smooth sailin' ahead
    }

    // Create a friendly message for the crew
    get renewalMessage() {
        const days = this.daysUntilRenewal;
        
        if (days < 0) {
            const overdueDays = Math.abs(days);
            return `Arrr! Account renewal be ${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue!`;
        } else if (days === 0) {
            return 'Ahoy! Account renewal be today, mate!';
        } else if (days === 1) {
            return 'Hoist the colors! Account renewal be tomorrow!';
        } else {
            return `${days} days until account renewal`;
        }
    }

    // Display days as a large number for the dashboard
    get displayDays() {
        const days = this.daysUntilRenewal;
        return days !== null ? days : '--';
    }
}