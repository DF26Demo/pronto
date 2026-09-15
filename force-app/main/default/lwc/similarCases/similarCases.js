import { LightningElement, api, wire } from 'lwc';
import getSimilarCases from '@salesforce/apex/SimilarCasesController.getSimilarCases';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Arr! Fields we need from the current case to find similar treasure
const CASE_FIELDS = [
    'Case.Subject',
    'Case.Priority',
    'Case.Type',
    'Case.Status'
];

// Blimey! Define the columns for our datatable of similar cases
const COLUMNS = [
    { 
        label: 'Case Number', 
        fieldName: 'caseUrl', 
        type: 'url',
        sortable: true,
        typeAttributes: {
            label: { fieldName: 'CaseNumber' },
            target: '_blank'
        }
    },
    { label: 'Subject', fieldName: 'Subject', type: 'text', sortable: true, wrapText: true },
    { label: 'Status', fieldName: 'Status', type: 'text', sortable: true },
    { label: 'Priority', fieldName: 'Priority', type: 'text', sortable: true },
    { label: 'Type', fieldName: 'Type', type: 'text', sortable: true },
    { 
        label: 'Created Date', 
        fieldName: 'CreatedDate', 
        type: 'date',
        sortable: true,
        typeAttributes: {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }
    }
];

export default class SimilarCases extends LightningElement {
    @api recordId; // Automatically set to the Case ID when on a record page
    
    cases = [];
    columns = COLUMNS;
    error;
    sortBy;
    sortDirection = 'desc';
    isLoading = false;

    // Arr! First, we need to load the current case's details
    @wire(getRecord, { recordId: '$recordId', fields: CASE_FIELDS })
    currentCase;

    // Shiver me timbers! Wire up the Apex method to fetch similar cases
    @wire(getSimilarCases, { 
        caseId: '$recordId',
        subject: '$caseSubject',
        priority: '$casePriority',
        caseType: '$caseType',
        status: '$caseStatus'
    })
    wiredCases({ error, data }) {
        if (data) {
            // Yo ho ho! Transform the data to include URLs for navigation
            this.cases = data.map(caseRecord => {
                return {
                    ...caseRecord,
                    caseUrl: `/${caseRecord.Id}`
                };
            });
            this.error = undefined;
        } else if (error) {
            // Walk the plank! We've encountered an error
            this.error = error;
            this.cases = [];
        }
    }

    // Arr! Extract the subject from the current case
    get caseSubject() {
        return getFieldValue(this.currentCase.data, 'Case.Subject');
    }

    // Fetch the priority, matey!
    get casePriority() {
        return getFieldValue(this.currentCase.data, 'Case.Priority');
    }

    // What type of case be this?
    get caseType() {
        return getFieldValue(this.currentCase.data, 'Case.Type');
    }

    // Status check, ye scallywag!
    get caseStatus() {
        return getFieldValue(this.currentCase.data, 'Case.Status');
    }

    get hasCases() {
        return this.cases && this.cases.length > 0;
    }

    get cardTitle() {
        const count = this.cases ? this.cases.length : 0;
        return `Similar Cases (${count})`;
    }

    // Handle column sorting like a skilled navigator charting a course
    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    // Arr! Sort our treasure by the selected column
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.cases));
        let keyValue = (a) => {
            return a[fieldname];
        };

        let isReverse = direction === 'asc' ? 1 : -1;

        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });

        this.cases = parseData;
    }
}