// Arr, this here component calculates how many days 'til a contact's birthday!
import { LightningElement, api, wire } from 'lwc';
import getContactBirthdate from '@salesforce/apex/BirthdayCountdownController.getContactBirthdate';

export default class BirthdayCountdown extends LightningElement {
    @api recordId; // Blimey! The Contact record ID from the page
    birthdate;
    daysUntilBirthday;
    errorMessage;
    isLoading = true;

    // Hoist the sails and fetch the birthdate from the seven seas (or Salesforce)
    @wire(getContactBirthdate, { contactId: '$recordId' })
    wiredBirthdate({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.birthdate = data;
            this.calculateDaysUntilBirthday();
            this.errorMessage = undefined;
        } else if (error) {
            // Shiver me timbers! Something went wrong
            this.errorMessage = 'Unable to fetch birthdate, ye scallywag!';
            this.daysUntilBirthday = undefined;
            this.birthdate = undefined;
        }
    }

    // Here be the navigation charts — calculate days 'til the next birthday
    calculateDaysUntilBirthday() {
        if (!this.birthdate) {
            this.daysUntilBirthday = undefined;
            return;
        }

        const today = new Date();
        const birthDate = new Date(this.birthdate);
        
        // Set this year's birthday, adjustin' for the current year like a proper pirate
        let nextBirthday = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );

        // If we've already passed the birthday this year, set course for next year!
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the days between now and the next birthday
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        this.daysUntilBirthday = diffDays;
    }

    // Check if today be the glorious day!
    get isBirthdayToday() {
        return this.daysUntilBirthday === 0;
    }

    // Check if we have a countdown to show
    get hasCountdown() {
        return this.daysUntilBirthday !== undefined && this.daysUntilBirthday !== null;
    }

    // Format the message for the landlubbers
    get countdownMessage() {
        if (this.isBirthdayToday) {
            return '🎉 Happy Birthday, matey!';
        }
        const dayWord = this.daysUntilBirthday === 1 ? 'day' : 'days';
        return `${this.daysUntilBirthday} ${dayWord} until birthday`;
    }
}