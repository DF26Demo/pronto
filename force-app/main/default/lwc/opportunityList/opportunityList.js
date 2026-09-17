import { LightningElement, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';

// Arr! The fields we be plunderin' from each opportunity
const FIELDS = [
    'Opportunity.Name',
    'Opportunity.StageName',
    'Opportunity.Amount',
    'Opportunity.CloseDate',
    'Opportunity.AccountId'
];

export default class OpportunityList extends LightningElement {
    opportunities = [];
    error;

    // Blimey! The columns for our treasure map (data table)
    columns = [
        { 
            label: 'Opportunity Name', 
            fieldName: 'Name', 
            type: 'text',
            sortable: true 
        },
        { 
            label: 'Stage', 
            fieldName: 'StageName', 
            type: 'text',
            sortable: true 
        },
        { 
            label: 'Amount', 
            fieldName: 'Amount', 
            type: 'currency',
            sortable: true,
            cellAttributes: { alignment: 'left' }
        },
        { 
            label: 'Close Date', 
            fieldName: 'CloseDate', 
            type: 'date',
            sortable: true 
        },
        { 
            label: 'Account', 
            fieldName: 'AccountId', 
            type: 'text' 
        }
    ];

    // Ahoy! Wire service sets sail to fetch all opportunities from the seven seas
    @wire(getListUi, {
        objectApiName: OPPORTUNITY_OBJECT,
        listViewApiName: 'AllOpportunities'
    })
    wiredOpportunities({ error, data }) {
        if (data) {
            // Yo-ho-ho! We've found the treasure (opportunities)
            this.opportunities = data.records.records.map(record => {
                return {
                    Id: record.id,
                    Name: record.fields.Name.value,
                    StageName: record.fields.StageName.value,
                    Amount: record.fields.Amount.value,
                    CloseDate: record.fields.CloseDate.value,
                    AccountId: record.fields.Account?.displayValue || 'No Account'
                };
            });
            this.error = undefined;
        } else if (error) {
            // Shiver me timbers! We've hit rough waters
            this.error = error;
            this.opportunities = [];
            console.error('Error loading opportunities:', error);
        }
    }

    // Fair winds! Check if we have any booty to display
    get hasOpportunities() {
        return this.opportunities && this.opportunities.length > 0;
    }
}