import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import RENEWAL_DATE_FIELD from '@salesforce/schema/Account.Renewal_Date__c';

// Arr! Fields we need to fetch from the Account treasure chest
const FIELDS = [RENEWAL_DATE_FIELD];

export default class AccountRenewalDays extends LightningElement {
    @api recordId; // Automatically set to the Account ID when on a record page
    
    renewalDate;
    error;

    // Wire the getRecord to fetch the renewal date from the Account
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            // Shiver me timbers! We found the renewal date
            this.renewalDate = data.fields.Renewal_Date__c.value;
            this.error = undefined;
        } else if (error) {
            // Blimey! We've hit a reef
            this.error = error;
            this.renewalDate = null;
        }
    }

    // Calculate days until renewal like counting gold coins
    get daysUntilRenewal() {
        if (!this.renewalDate) {
            return null;
        }
        
        const today = new Date();
        const renewal = new Date(this.renewalDate);
        
        // Clear the time portion so we only count full days, matey
        today.setHours(0, 0, 0, 0);
        renewal.setHours(0, 0, 0, 0);
        
        const diffTime = renewal - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    // Determine if renewal is approaching or has passed
    get statusVariant() {
        const days = this.daysUntilRenewal;
        if (days === null) return 'warning';
        if (days < 0) return 'error'; // Already passed - abandon ship!
        if (days <= 30) return 'warning'; // Coming soon - batten down the hatches!
        return 'success'; // Smooth sailing ahead
    }

    get statusMessage() {
        const days = this.daysUntilRenewal;
        if (days === null) return 'No renewal date set';
        if (days < 0) return `Overdue by ${Math.abs(days)} days`;
        if (days === 0) return 'Renews today!';
        if (days === 1) return '1 day until renewal';
        return `${days} days until renewal`;
    }

    get hasRenewalDate() {
        return this.renewalDate !== null && this.renewalDate !== undefined;
    }
}
