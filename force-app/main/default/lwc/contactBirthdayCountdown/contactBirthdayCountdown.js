import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

// Arr! We be needin' the birthdate field from the Contact treasure chest
const FIELDS = [BIRTHDATE_FIELD];

export default class ContactBirthdayCountdown extends LightningElement {
    @api recordId; // The Contact's unique identifier, set by the Lightning page
    
    birthdate;
    error;

    // Wire up the Contact record to fetch the birthdate, savvy?
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredContact({ error, data }) {
        if (data) {
            // Hoist the colors! We've found the birthdate
            this.birthdate = getFieldValue(data, BIRTHDATE_FIELD);
            this.error = undefined;
        } else if (error) {
            // Blimey! Something went wrong on the high seas
            this.error = error;
            this.birthdate = undefined;
        }
    }

    // Calculate how many days 'til the birthday celebration, ye scallywag!
    get daysUntilBirthday() {
        if (!this.birthdate) {
            return null;
        }

        const today = new Date();
        const birthDate = new Date(this.birthdate);
        
        // Set this year's birthday by keepin' the month and day, changin' the year
        let nextBirthday = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );

        // If the birthday already passed this year, set sail for next year's celebration!
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the difference in days like countin' doubloons
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    // Check if we have a valid day count to display
    get hasDaysCount() {
        return this.daysUntilBirthday !== null && this.daysUntilBirthday !== undefined;
    }

    // Arr! Special message for today's birthday celebration
    get isBirthdayToday() {
        return this.daysUntilBirthday === 0;
    }

    // Display message based on days remaining
    get birthdayMessage() {
        if (this.isBirthdayToday) {
            return "🎉 Shiver me timbers! It be their birthday today! 🎉";
        }
        const days = this.daysUntilBirthday;
        return `${days} ${days === 1 ? 'day' : 'days'} until birthday`;
    }

    // Check if birthdate be missin' from the treasure map
    get noBirthdate() {
        return !this.birthdate && !this.error;
    }
}