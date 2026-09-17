import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import RENEWAL_DATE_FIELD from '@salesforce/schema/Account.Renewal_Date__c';

// Arr, these be the fields we need to fetch from the Account treasure chest
const FIELDS = [RENEWAL_DATE_FIELD];

export default class AccountRenewalCounter extends LightningElement {
    @api recordId;
    renewalDate;
    isLoading = true;

    // Ahoy! Wire up the record data from Salesforce's hold
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        this.isLoading = false;
        if (data) {
            // Plunder the renewal date from the record, matey!
            this.renewalDate = data.fields.Renewal_Date__c?.value;
        } else if (error) {
            // Blimey! Something went wrong on the high seas
            console.error('Error loading account:', error);
            this.renewalDate = null;
        }
    }

    // Check if we found the renewal date treasure
    get hasRenewalDate() {
        return this.renewalDate != null;
    }

    // Calculate how many days till we need to renew, savvy?
    get daysUntilRenewal() {
        if (!this.renewalDate) {
            return null;
        }

        // Hoist the dates and calculate the difference!
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const renewal = new Date(this.renewalDate);
        renewal.setHours(0, 0, 0, 0);

        // Count the days between here and the horizon
        const diffTime = renewal - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    // Arr, what be the proper label for these days?
    get daysLabel() {
        const days = this.daysUntilRenewal;
        if (days === null) return '';
        if (days === 1) return 'day until renewal';
        if (days === -1) return 'day overdue';
        if (days > 0) return 'days until renewal';
        if (days < 0) return 'days overdue';
        return 'Renewal is today!';
    }

    // Style the counter based on how close we be to renewal - red means danger ahead!
    get daysClass() {
        const days = this.daysUntilRenewal;
        let className = 'days-number slds-text-heading_large slds-text-align_center slds-m-bottom_x-small';
        
        if (days < 0) className += ' text-danger';      // Shiver me timbers, we be overdue!
        else if (days <= 7) className += ' text-warning'; // Batten down the hatches, renewal be near!
        else className += ' text-success';               // Smooth sailing ahead, plenty of time
        
        return className;
    }
}