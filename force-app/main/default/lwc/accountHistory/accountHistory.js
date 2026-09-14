import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getAccountHistory from '@salesforce/apex/AccountHistoryController.getAccountHistory';

// Arr, these be the fields we need from the Account, savvy?
const FIELDS = ['Account.Id', 'Account.Name'];

export default class AccountHistory extends LightningElement {
    @api recordId; // Blimey! This here be the current record's ID from the page
    historyRecords = [];
    error;
    isLoading = true;

    // Shiver me timbers! Wire up the account record so we know we're on an Account page
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    account;

    // Ahoy! When the component loads, fetch the history from Davy Jones' locker
    connectedCallback() {
        this.loadAccountHistory();
    }

    // Here be the method that sails to the backend to fetch our treasure
    loadAccountHistory() {
        this.isLoading = true;
        this.error = undefined;

        getAccountHistory({ accountId: this.recordId })
            .then(result => {
                // Yo ho ho! We found the booty - format it for the crew to see
                this.historyRecords = result.map(record => {
                    return {
                        Id: record.Id,
                        Field: record.Field || 'N/A',
                        OldValue: this.formatValue(record.OldValue),
                        NewValue: this.formatValue(record.NewValue),
                        ChangedBy: record.CreatedBy?.Name || 'Unknown',
                        ChangedDate: this.formatDate(record.CreatedDate)
                    };
                });
                this.isLoading = false;
            })
            .catch(error => {
                // Walk the plank! Something went wrong in the deep blue sea
                this.error = 'Failed to load account history: ' + (error.body?.message || error.message);
                this.isLoading = false;
                this.historyRecords = [];
            });
    }

    // Arr, format the date so landlubbers can read it proper
    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Avast! Make null values walk the plank and show 'N/A' instead
    formatValue(value) {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        return value;
    }

    // Check if we've got any treasure in our hold
    get hasHistory() {
        return !this.isLoading && !this.error && this.historyRecords && this.historyRecords.length > 0;
    }
}