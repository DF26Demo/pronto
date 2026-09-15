import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getSimilarCases from '@salesforce/apex/SimilarCasesController.getSimilarCases';
import SUBJECT_FIELD from '@salesforce/schema/Case.Subject';
import PRIORITY_FIELD from '@salesforce/schema/Case.Priority';
import PRODUCT_FIELD from '@salesforce/schema/Case.Product__c';

const FIELDS = [SUBJECT_FIELD, PRIORITY_FIELD, PRODUCT_FIELD];

export default class SimilarCases extends LightningElement {
    @api recordId;
    similarCases = [];
    error;
    isLoading = false;

    // Arr! Fetch the current case details so we can find its mates
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredCase({ error, data }) {
        if (data) {
            // Blimey! We've got the case, now let's find similar treasures
            this.findSimilarCases(data);
        } else if (error) {
            // Shiver me timbers! Something went wrong
            this.error = error;
            this.isLoading = false;
        }
    }

    // This method sails through the database to find similar cases
    findSimilarCases(caseRecord) {
        this.isLoading = true;
        const subject = caseRecord.fields.Subject.value;
        const priority = caseRecord.fields.Priority.value;
        const product = caseRecord.fields.Product__c?.value;

        getSimilarCases({ 
            currentCaseId: this.recordId,
            subject: subject,
            priority: priority,
            productId: product
        })
        .then(result => {
            // Yo ho ho! We found some similar cases
            this.similarCases = result;
            this.error = undefined;
            this.isLoading = false;
        })
        .catch(error => {
            // Walk the plank! An error occurred
            this.error = error;
            this.similarCases = [];
            this.isLoading = false;
        });
    }

    // Check if we have any booty to display
    get hasCases() {
        return this.similarCases && this.similarCases.length > 0;
    }

    // Navigate to a case record like a pirate sailing to treasure island
    handleCaseClick(event) {
        const caseId = event.currentTarget.dataset.id;
        // Arr, let the browser handle the navigation naturally via the anchor tag
    }
}