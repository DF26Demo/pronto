import { LightningElement, api, wire } from 'lwc';
import getCases from '@salesforce/apex/AccountCaseListController.getCases';
import { refreshApex } from '@salesforce/apex';

// Arr, columns for our treasure map of cases
const COLUMNS = [
    { label: 'Case Number', fieldName: 'CaseNumber', type: 'text' },
    { label: 'Subject', fieldName: 'Subject', type: 'text' },
    { label: 'Status', fieldName: 'Status', type: 'text' },
    { label: 'Priority', fieldName: 'Priority', type: 'text' },
    { label: 'Created Date', fieldName: 'CreatedDate', type: 'date' }
];

export default class AccountCaseList extends LightningElement {
    @api recordId; // Blimey! This be the Account Id from the record page
    columns = COLUMNS;
    cases = [];
    error;
    wiredCasesResult;

    @wire(getCases, { accountId: '$recordId' })
    wiredCases(result) {
        this.wiredCasesResult = result;
        if (result.data) {
            // Ahoy! We've got the cases aboard
            this.cases = result.data;
            this.error = undefined;
        } else if (result.error) {
            // Shiver me timbers! Something went wrong
            this.error = result.error;
            this.cases = [];
        }
    }

    get hasNoCases() {
        // If the hold be empty, we show a message
        return this.cases.length === 0 && !this.error;
    }

    handleRefresh() {
        // Hoist the sails and refresh the cargo!
        return refreshApex(this.wiredCasesResult);
    }
}