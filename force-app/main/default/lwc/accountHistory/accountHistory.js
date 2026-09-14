import { LightningElement, api, wire } from 'lwc';
import getAccountHistory from '@salesforce/apex/AccountHistoryController.getAccountHistory';

// Arr! Define the columns for our history log (datatable)
const COLUMNS = [
    { 
        label: 'Date Changed', 
        fieldName: 'CreatedDate', 
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
    { label: 'Changed By', fieldName: 'CreatedByName', type: 'text', sortable: true },
    { label: 'Field', fieldName: 'Field', type: 'text', sortable: true },
    { label: 'Old Value', fieldName: 'OldValue', type: 'text' },
    { label: 'New Value', fieldName: 'NewValue', type: 'text' }
];

export default class AccountHistory extends LightningElement {
    @api recordId; // Automatically set to the Account ID when on a record page
    
    historyRecords = [];
    columns = COLUMNS;
    error;
    sortBy = 'CreatedDate';
    sortDirection = 'desc';

    // Wire the Apex method to fetch account history when component loads
    @wire(getAccountHistory, { accountId: '$recordId' })
    wiredHistory({ error, data }) {
        if (data) {
            // Shiver me timbers! Transform the data so CreatedBy.Name displays properly
            this.historyRecords = data.map(historyRecord => {
                return {
                    ...historyRecord,
                    CreatedByName: historyRecord.CreatedBy.Name
                };
            });
            this.error = undefined;
        } else if (error) {
            // Blimey! We've encountered stormy seas
            this.error = error;
            this.historyRecords = [];
        }
    }

    get hasHistory() {
        return this.historyRecords && this.historyRecords.length > 0;
    }

    // Handle column sorting like a skilled navigator
    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    // Arr! This sorts our log by the selected column
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.historyRecords));
        let keyValue = (a) => {
            return a[fieldname];
        };

        let isReverse = direction === 'asc' ? 1 : -1;

        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });

        this.historyRecords = parseData;
    }
}
