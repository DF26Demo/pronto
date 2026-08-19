import { LightningElement, api, wire } from 'lwc';
import getClosedCases from '@salesforce/apex/ClosedCasesController.getClosedCases';

// Arr, these be the columns for our data treasure table
const COLUMNS = [
    {
        label: 'Case Number',
        fieldName: 'CaseNumber',
        type: 'text',
        sortable: true
    },
    {
        label: 'Subject',
        fieldName: 'Subject',
        type: 'text',
        sortable: true
    },
    {
        label: 'Closed Date',
        fieldName: 'ClosedDate',
        type: 'date',
        sortable: true,
        typeAttributes: {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }
    },
    {
        label: 'Reason',
        fieldName: 'Reason',
        type: 'text'
    },
    {
        label: 'Priority',
        fieldName: 'Priority',
        type: 'text'
    }
];

export default class ClosedCases extends LightningElement {
    @api recordId; // Arr, this be the Account ID passed from the record page
    columns = COLUMNS;

    // Here be the wire service that fetches our closed cases from the Apex controller
    @wire(getClosedCases, { accountId: '$recordId' })
    cases;

    // This here method checks if we found any treasure (cases) in our hold
    get hasCases() {
        // Blimey! If the data array has length, we've got cases to show
        return this.cases.data && this.cases.data.length > 0;
    }
}