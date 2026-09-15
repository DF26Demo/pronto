import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

export default class BirthdayCountdown extends LightningElement {
    @api recordId;
    daysUntilBirthday = null;
    birthdateValue = null;
    error;

    // Arr, we be fetching the contact's birthdate from the seven seas of Salesforce!
    @wire(getRecord, { recordId: '$recordId', fields: [BIRTHDATE_FIELD] })
    wiredContact({ error, data }) {
        if (data) {
            // Blimey! We found the treasure (the birthdate)
            this.birthdateValue = data.fields.Birthdate.value;
            this.calculateDaysUntilBirthday();
            this.error = undefined;
        } else if (error) {
            // Shiver me timbers! Something went wrong
            this.error = error;
            this.birthdateValue = null;
            this.daysUntilBirthday = null;
        }
    }

    // Here be the logic to calculate days until the next birthday voyage!
    calculateDaysUntilBirthday() {
        if (!this.birthdateValue) {
            // If there be no birthdate, we abandon ship early
            this.daysUntilBirthday = null;
            return;
        }

        const today = new Date();
        const birthdate = new Date(this.birthdateValue);
        
        // Hoist the birthday flag for this year, matey!
        const nextBirthday = new Date(
            today.getFullYear(),
            birthdate.getMonth(),
            birthdate.getDate()
        );

        // If the birthday already sailed past this year, set course for next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the days between now and the birthday treasure
        const timeDiff = nextBirthday.getTime() - today.getTime();
        this.daysUntilBirthday = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }

    // Return a jolly message for the crew to see!
    get birthdayMessage() {
        if (this.daysUntilBirthday === null) {
            return 'No birthdate on record, captain!';
        }
        
        if (this.daysUntilBirthday === 0) {
            return '🎉 Happy Birthday, matey! Celebrate on the high seas!';
        }
        
        if (this.daysUntilBirthday === 1) {
            return '⚓ Only 1 day until the birthday celebration!';
        }
        
        return `🏴‍☠️ ${this.daysUntilBirthday} days until the birthday celebration!`;
    }

    // Check if we have a valid countdown to display
    get hasValidBirthdate() {
        return this.daysUntilBirthday !== null;
    }
}