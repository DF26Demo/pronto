import { LightningElement, api, wire } from 'lwc';
import getAllCases from '@salesforce/apex/AccountAllCasesController.getAllCases';

// Arr! Define the columns for our complete treasure map (datatable)
const COLUMNS = [
    { 
        label: 'Case Number', 
        fieldName: 'caseUrl', 
        type: 'url',
        typeAttributes: { label: { fieldName: 'CaseNumber' } },
        sortable: true 
    },
    { label: 'Subject', fieldName: 'Subject', type: 'text', sortable: true },
    { label: 'Status', fieldName: 'Status', type: 'text', sortable: true },
    { label: 'Priority', fieldName: 'Priority', type: 'text', sortable: true },
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
    },
    { label: 'Owner', fieldName: 'OwnerName', type: 'text', sortable: true }
];

export default class AccountAllCases extends LightningElement {
    @api recordId; // Automatically set to the Account ID when on a record page
    
    cases = [];
    columns = COLUMNS;
    error;
    sortBy;
    sortDirection = 'desc'; // Newest first, me hearties!

    // Wire the Apex method to fetch all cases when component loads
    @wire(getAllCases, { accountId: '$recordId' })
    wiredCases({ error, data }) {
        if (data) {
            // Shiver me timbers! Transform the data so Owner.Name displays properly
            // Also create URLs to navigate to each case like a proper treasure map
            this.cases = data.map(caseRecord => {
                return {
                    ...caseRecord,
                    OwnerName: caseRecord.Owner.Name,
                    caseUrl: `/${caseRecord.Id}` // Arr! Link to the case record
                };
            });
            this.error = undefined;
        } else if (error) {
            // Blimey! We've encountered stormy weather
            this.error = error;
            this.cases = [];
        }
    }

    get hasCases() {
        return this.cases && this.cases.length > 0;
    }

    get caseCount() {
        return this.cases ? this.cases.length : 0;
    }

    // Handle column sorting like a skilled navigator charting the course
    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    // Arr! This sorts our loot by the selected column
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
