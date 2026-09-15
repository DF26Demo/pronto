import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

// Arr! We be needin' the birthdate field to calculate our countdown
const FIELDS = [BIRTHDATE_FIELD];

export default class BirthdayCountdown extends LightningElement {
    @api recordId; // The Contact ID, handed to us by the Lightning gods
    
    birthdate;
    error;

    // Wire up the contact record like a ship to its anchor
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredContact({ error, data }) {
        if (data) {
            // Shiver me timbers! We found the birthdate
            this.birthdate = getFieldValue(data, BIRTHDATE_FIELD);
            this.error = undefined;
        } else if (error) {
            // Blimey! The treasure map be unreadable
            this.error = error;
            this.birthdate = undefined;
        }
    }

    // Calculate how many sunrises until the next birthday celebration
    get daysUntilBirthday() {
        if (!this.birthdate) {
            // No birthdate? Then there be no countdown to chart!
            return null;
        }

        // Arr! Parse the birthdate from the treasure chest
        const today = new Date();
        const birthDate = new Date(this.birthdate);
        
        // Set this year's birthday celebration date
        const nextBirthday = new Date(
            today.getFullYear(),
            birthDate.getMonth(),
            birthDate.getDate()
        );

        // If we've already sailed past the birthday this year, set course for next year!
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the days between now and the next birthday bash
        const timeDiff = nextBirthday.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return daysDiff;
    }

    // Check if today be the day of celebration!
    get isBirthdayToday() {
        return this.daysUntilBirthday === 0;
    }

    // Display a proper message for the crew
    get birthdayMessage() {
        if (!this.birthdate) {
            return 'No birthday on record, matey!';
        }
        
        const days = this.daysUntilBirthday;
        
        if (days === 0) {
            return '🎉 Hoist the colors! Today be the day!';
        } else if (days === 1) {
            return '1 day until the birthday celebration!';
        } else {
            return `${days} days until the birthday celebration!`;
        }
    }

    // Show the countdown card only if we have a birthdate
    get showCountdown() {
        return this.birthdate !== undefined && this.birthdate !== null;
    }
}
