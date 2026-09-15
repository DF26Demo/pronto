import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import findSimilarCases from '@salesforce/apex/SimilarCasesController.findSimilarCases';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SimilarCases extends NavigationMixin(LightningElement) {
    @api recordId; // Arr, this be the current Case record ID from the page
    similarCases = [];
    error;
    isLoading = true;

    // Ahoy! When the component loads, we fetch similar cases from the seven seas of data
    @wire(findSimilarCases, { caseId: '$recordId' })
    wiredCases({ error, data }) {
        this.isLoading = false;
        if (data) {
            // Blimey! We found some treasure (similar cases)
            this.similarCases = data;
            this.error = undefined;
        } else if (error) {
            // Shiver me timbers! Something went wrong
            this.error = error;
            this.similarCases = [];
            this.showErrorToast();
        }
    }

    // Avast! Check if we found any similar cases worth displayin'
    get hasSimilarCases() {
        return this.similarCases && this.similarCases.length > 0;
    }

    // Navigate to the selected case like a ship to harbor
    handleCaseClick(event) {
        const caseId = event.currentTarget.dataset.id;
        // Set sail to the case record page!
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: caseId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }

    // Walk the plank of despair - show error message to the crew
    showErrorToast() {
        const event = new ShowToastEvent({
            title: 'Error Loading Similar Cases',
            message: 'Unable to fetch similar cases. Check yer connection, matey!',
            variant: 'error'
        });
        this.dispatchEvent(event);
    }
}