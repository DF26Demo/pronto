import { LightningElement, api, wire } from 'lwc';
import getClosedCases from '@salesforce/apex/AccountClosedCasesController.getClosedCases';
import { refreshApex } from '@salesforce/apex';

export default class AccountClosedCases extends LightningElement {
    @api recordId; // Arr, this be the Account ID passed from the record page
    cases = [];
    error;
    wiredCasesResult;

    // Blimey! Wire up the Apex method to fetch our treasured cases
    @wire(getClosedCases, { accountId: '$recordId' })
    wiredCases(result) {
        this.wiredCasesResult = result;
        if (result.data) {
            // Hoist the data aboard!
            this.cases = result.data;
            this.error = undefined;
        } else if (result.error) {
            // Shiver me timbers, something went wrong!
            this.error = result.error;
            this.cases = [];
        }
    }

    // Here be the columns for our data table, as fine as any ship's manifest
    columns = [
        { label: 'Case Number', fieldName: 'CaseNumber', type: 'text' },
        { label: 'Subject', fieldName: 'Subject', type: 'text' },
        { label: 'Status', fieldName: 'Status', type: 'text' },
        { label: 'Closed Date', fieldName: 'ClosedDate', type: 'date', typeAttributes: {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }},
        { label: 'Priority', fieldName: 'Priority', type: 'text' }
    ];

    get hasCases() {
        // Check if we've found any booty
        return this.cases && this.cases.length > 0;
    }

    get noCasesMessage() {
        // Arr, the hold be empty!
        return 'No closed cases found in the last 2 years, matey!';
    }

    handleRefresh() {
        // Refresh the cache like swabbin' the deck
        return refreshApex(this.wiredCasesResult);
    }
}