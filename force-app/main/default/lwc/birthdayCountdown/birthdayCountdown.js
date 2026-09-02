import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

const FIELDS = [BIRTHDATE_FIELD];

export default class BirthdayCountdown extends LightningElement {
    @api recordId;
    
    daysUntilBirthday = 0;
    formattedBirthdate = '';
    isLoading = true;
    hasError = false;
    errorMessage = '';
    isBirthdayToday = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredContact({ error, data }) {
        this.isLoading = true;
        
        if (data) {
            // Arr, we found the treasure (contact data)!
            const birthdate = getFieldValue(data, BIRTHDATE_FIELD);
            
            if (birthdate) {
                this.calculateDaysUntilBirthday(birthdate);
                this.hasError = false;
            } else {
                // Blimey! No birthday on the manifest
                this.hasError = true;
                this.errorMessage = 'No birthdate found for this contact. Walk the plank and add one!';
            }
            
            this.isLoading = false;
        } else if (error) {
            // Here be dragons! Something went wrong
            this.hasError = true;
            this.errorMessage = 'Error loading contact data: ' + (error.body?.message || 'Unknown error');
            this.isLoading = false;
        }
    }

    calculateDaysUntilBirthday(birthdate) {
        // Arr, time to chart the course to the birthday!
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const birth = new Date(birthdate);
        this.formattedBirthdate = birth.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Calculate next birthday by setting the year to current year
        const nextBirthday = new Date(
            today.getFullYear(),
            birth.getMonth(),
            birth.getDate()
        );
        
        // If birthday already passed this year, sail to next year's birthday
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        // Calculate the difference in days
        const diffTime = nextBirthday - today;
        this.daysUntilBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Check if today be the special day!
        this.isBirthdayToday = this.daysUntilBirthday === 0;
    }

    get showCountdown() {
        return !this.isLoading && !this.hasError;
    }

    get countdownMessage() {
        if (this.daysUntilBirthday === 1) {
            return "day until their birthday! Prepare the rum!";
        }
        return "days until their birthday";
    }
}