import { LightningElement, wire } from 'lwc';
import getMyOpportunities from '@salesforce/apex/OpportunitiesListController.getMyOpportunities';
import { NavigationMixin } from 'lightning/navigation';

// Arr! Define the columns for our treasure map (datatable)
const COLUMNS = [
    { 
        label: 'Opportunity Name', 
        fieldName: 'opportunityUrl', 
        type: 'url',
        sortable: true,
        typeAttributes: {
            label: { fieldName: 'Name' },
            target: '_blank'
        }
    },
    { label: 'Account', fieldName: 'AccountName', type: 'text', sortable: true },
    { label: 'Stage', fieldName: 'StageName', type: 'text', sortable: true },
    { 
        label: 'Amount', 
        fieldName: 'Amount', 
        type: 'currency', 
        sortable: true,
        typeAttributes: {
            currencyCode: 'USD'
        }
    },
    { 
        label: 'Close Date', 
        fieldName: 'CloseDate', 
        type: 'date',
        sortable: true,
        typeAttributes: {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }
    }
];

export default class OpportunitiesList extends NavigationMixin(LightningElement) {
    opportunities = [];
    columns = COLUMNS;
    error;
    sortBy;
    sortDirection = 'asc';

    // Wire the Apex method to fetch opportunities when component loads
    @wire(getMyOpportunities)
    wiredOpportunities({ error, data }) {
        if (data) {
            // Shiver me timbers! Transform the data so Account.Name displays properly
            // and add clickable URLs to each opportunity
            this.opportunities = data.map(opp => {
                return {
                    ...opp,
                    AccountName: opp.Account ? opp.Account.Name : '',
                    opportunityUrl: `/${opp.Id}`
                };
            });
            this.error = undefined;
        } else if (error) {
            // Blimey! We've encountered an error on the high seas
            this.error = error;
            this.opportunities = [];
        }
    }

    get hasOpportunities() {
        return this.opportunities && this.opportunities.length > 0;
    }

    get opportunityCount() {
        return this.opportunities ? this.opportunities.length : 0;
    }

    // Handle column sorting like a skilled navigator
    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    // Arr! This sorts our loot by the selected column
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.opportunities));
        let keyValue = (a) => {
            return a[fieldname];
        };

        let isReverse = direction === 'asc' ? 1 : -1;

        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });

        this.opportunities = parseData;
    }
}