import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';
import NAME_FIELD from '@salesforce/schema/Contact.Name';

export default class BirthdayCountdown extends LightningElement {
    @api recordId;

    // Arr, we be fetchin' the Contact's birthdate and name from Davy Jones' database
    @wire(getRecord, { recordId: '$recordId', fields: [BIRTHDATE_FIELD, NAME_FIELD] })
    contact;

    get contactName() {
        // Grab the scallywag's name
        return getFieldValue(this.contact.data, NAME_FIELD);
    }

    get hasBirthdate() {
        // Check if this contact has a birthdate in the ship's log
        return this.contact.data && getFieldValue(this.contact.data, BIRTHDATE_FIELD);
    }

    get birthdate() {
        // Parse the birthdate like a treasure map
        if (!this.hasBirthdate) return null;
        return new Date(getFieldValue(this.contact.data, BIRTHDATE_FIELD));
    }

    get isBirthdayToday() {
        // Blimey! Check if today be the day we celebrate!
        if (!this.birthdate) return false;
        
        const today = new Date();
        return today.getMonth() === this.birthdate.getMonth() && 
               today.getDate() === this.birthdate.getDate();
    }

    get daysUntilBirthday() {
        // Calculate how many sunrises until the celebration
        if (!this.birthdate) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Set sail for the next birthday by calculating the target year
        let nextBirthday = new Date(
            today.getFullYear(),
            this.birthdate.getMonth(),
            this.birthdate.getDate()
        );

        // If we already sailed past the birthday this year, chart course for next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the days like a navigator reads the stars
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    get countdownText() {
        // Craft the message for the crew
        const days = this.daysUntilBirthday;
        if (days === 1) {
            return "day until this matey's birthday!";
        }
        return "days until this matey's birthday!";
    }

    get nextBirthdayFormatted() {
        // Format the date so even a landlubber can read it
        if (!this.birthdate) return '';

        const today = new Date();
        let nextBirthday = new Date(
            today.getFullYear(),
            this.birthdate.getMonth(),
            this.birthdate.getDate()
        );

        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        return nextBirthday.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
    }
}