// Arr, this component be countin' down the days 'til a contact's birthday!
import { LightningElement, api, wire } from 'lwc';
import getContactBirthdate from '@salesforce/apex/BirthdayCountdownController.getContactBirthdate';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BirthdayCountdown extends LightningElement {
    @api recordId; // Blimey! The Contact record ID from the page context
    
    daysUntilBirthday = null;
    birthdate = null;
    error = null;
    isLoading = true;

    // Here be where we fetch the contact's birthdate from the seven seas (Salesforce)
    @wire(getContactBirthdate, { contactId: '$recordId' })
    wiredBirthdate({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.birthdate = data;
            this.error = null;
            // Avast! Calculate the days 'til the big day
            this.calculateDaysUntilBirthday();
        } else if (error) {
            this.error = error;
            this.birthdate = null;
            this.daysUntilBirthday = null;
            // Walk the plank if there be an error!
            this.showToast('Error', 'Failed to fetch birthdate: ' + error.body.message, 'error');
        }
    }

    // Arr, this function calculates how many sunrises 'til the birthday treasure!
    calculateDaysUntilBirthday() {
        if (!this.birthdate) {
            return;
        }

        const today = new Date();
        const birthDate = new Date(this.birthdate);
        
        // Set this year's birthday - careful now, don't fall overboard!
        const thisYearBirthday = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );

        // If the birthday already passed this year, set sail for next year!
        if (thisYearBirthday < today) {
            thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the difference in milliseconds, then convert to days
        const timeDiff = thisYearBirthday - today;
        this.daysUntilBirthday = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }

    // Shiver me timbers! Check if it's the birthday today
    get isBirthdayToday() {
        return this.daysUntilBirthday === 0;
    }

    // Display a friendly message for landlubbers
    get displayMessage() {
        if (this.daysUntilBirthday === 0) {
            return "🎉 Avast! It be their birthday today! 🎉";
        } else if (this.daysUntilBirthday === 1) {
            return "Tomorrow be the day! Prepare the grog!";
        } else {
            return `${this.daysUntilBirthday} days until birthday`;
        }
    }

    // Show if we have no birthdate on record
    get noBirthdate() {
        return !this.isLoading && !this.birthdate && !this.error;
    }

    // Toast notification for errors - even pirates need good UX!
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}