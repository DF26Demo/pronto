import { LightningElement, wire } from 'lwc';
import getContactBirthdays from '@salesforce/apex/ContactBirthdayController.getContactBirthdays';

// Arr! Define the columns for our birthday treasure map (datatable)
const COLUMNS = [
    { 
        label: 'Contact Name', 
        fieldName: 'contactId',
        type: 'url',
        sortable: true,
        typeAttributes: {
            label: { fieldName: 'contactName' },
            target: '_blank'
        }
    },
    { label: 'Email', fieldName: 'email', type: 'email', sortable: true },
    { 
        label: 'Birthdate', 
        fieldName: 'birthdate', 
        type: 'date',
        sortable: true,
        typeAttributes: {
            month: 'short',
            day: '2-digit'
        }
    },
    { 
        label: 'Next Birthday', 
        fieldName: 'nextBirthday', 
        type: 'date',
        sortable: true,
        typeAttributes: {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }
    },
    { 
        label: 'Days Until Birthday', 
        fieldName: 'daysUntilBirthday', 
        type: 'number',
        sortable: true,
        cellAttributes: {
            // Blimey! Highlight birthdays that be comin' soon
            class: { fieldName: 'urgencyClass' }
        }
    }
];

export default class ContactBirthdayCountdown extends LightningElement {
    contacts = [];
    columns = COLUMNS;
    error;
    sortBy = 'daysUntilBirthday';
    sortDirection = 'asc';

    // Wire the Apex method to fetch birthday data when component loads
    @wire(getContactBirthdays)
    wiredContacts({ error, data }) {
        if (data) {
            // Shiver me timbers! Transform the data and add styling classes
            this.contacts = data.map(contact => {
                // Add urgency class based on how soon the birthday be
                let urgencyClass = '';
                if (contact.daysUntilBirthday === 0) {
                    urgencyClass = 'slds-text-color_success slds-text-title_bold';
                } else if (contact.daysUntilBirthday <= 7) {
                    urgencyClass = 'slds-text-color_error';
                } else if (contact.daysUntilBirthday <= 30) {
                    urgencyClass = 'slds-text-color_warning';
                }
                
                return {
                    ...contact,
                    contactId: '/' + contact.contactId, // Create proper URL for contact link
                    urgencyClass: urgencyClass
                };
            });
            this.error = undefined;
        } else if (error) {
            // Blimey! We've encountered stormy weather
            this.error = error;
            this.contacts = [];
        }
    }

    get hasContacts() {
        return this.contacts && this.contacts.length > 0;
    }

    // Handle column sorting like a skilled navigator
    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    // Arr! This sorts our birthday list by the selected column
    sortData(fieldname, direction) {
        // Remove the URL prefix for sorting contact names
        let sortField = fieldname === 'contactId' ? 'contactName' : fieldname;
        
        let parseData = JSON.parse(JSON.stringify(this.contacts));
        let keyValue = (a) => {
            return a[sortField];
        };

        let isReverse = direction === 'asc' ? 1 : -1;

        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });

        this.contacts = parseData;
    }
}
