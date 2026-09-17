import { LightningElement, api, wire } from 'lwc';
import getRenewalInfo from '@salesforce/apex/AccountRenewalCountdownController.getRenewalInfo';

export default class AccountRenewalCountdown extends LightningElement {
    @api recordId; // Automatically set to the Account ID when on a record page
    
    renewalDate;
    daysUntilRenewal;
    error;

    // Wire the Apex method to fetch renewal date when component loads
    @wire(getRenewalInfo, { accountId: '$recordId' })
    wiredRenewalInfo({ error, data }) {
        if (data) {
            // Shiver me timbers! We've got the renewal date
            this.renewalDate = data.renewalDate;
            this.daysUntilRenewal = data.daysUntilRenewal;
            this.error = undefined;
        } else if (error) {
            // Blimey! An error on the high seas
            this.error = error.body ? error.body.message : 'Unknown error';
            this.renewalDate = null;
            this.daysUntilRenewal = null;
        }
    }

    get hasRenewalDate() {
        return this.renewalDate != null;
    }

    get formattedRenewalDate() {
        if (!this.renewalDate) return '';
        // Format the date in a friendly way, arr!
        const date = new Date(this.renewalDate);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    get countdownClass() {
        // Color-code based on how many days are left, like flags on a ship!
        if (this.daysUntilRenewal < 0) {
            return 'slds-text-color_error slds-text-heading_large';
        } else if (this.daysUntilRenewal < 30) {
            return 'slds-text-color_error slds-text-heading_large';
        } else if (this.daysUntilRenewal < 90) {
            return 'slds-text-color_warning slds-text-heading_large';
        } else {
            return 'slds-text-color_success slds-text-heading_large';
        }
    }

    get countdownLabel() {
        // Arr! Provide appropriate labels for different scenarios
        if (this.daysUntilRenewal < 0) {
            return 'days overdue';
        } else if (this.daysUntilRenewal === 0) {
            return 'Renews today!';
        } else if (this.daysUntilRenewal === 1) {
            return 'day until renewal';
        } else {
            return 'days until renewal';
        }
    }
}