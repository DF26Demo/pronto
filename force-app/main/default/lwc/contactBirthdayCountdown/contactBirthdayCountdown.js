import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

// Arr! The fields we be plunderin' from the Contact record
const FIELDS = [BIRTHDATE_FIELD];

export default class ContactBirthdayCountdown extends LightningElement {
    @api recordId; // Automatically set to the Contact ID when on a record page
    
    birthdate;
    error;

    // Wire up the Contact record to fetch the birthdate, matey!
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredContact({ error, data }) {
        if (data) {
            // Shiver me timbers! We found the birthdate
            this.birthdate = data.fields.Birthdate.value;
            this.error = undefined;
        } else if (error) {
            // Blimey! Something went wrong on the high seas
            this.error = error;
            this.birthdate = null;
        }
    }

    // Calculate days until the next birthday like a proper navigator
    get daysUntilBirthday() {
        if (!this.birthdate) {
            return null;
        }

        // Arr! Let's chart a course to the next birthday
        const today = new Date();
        const birthDate = new Date(this.birthdate);
        
        // Set this year's birthday - keep the month and day, but use current year
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // If the birthday already passed this year, set sail for next year's celebration!
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        // Calculate the treasure: days remaining until the grand celebration
        const timeDiff = nextBirthday.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        return daysDiff;
    }

    // Check if today be the special day!
    get isBirthdayToday() {
        return this.daysUntilBirthday === 0;
    }

    // Display the countdown message, ye scallywag
    get countdownMessage() {
        const days = this.daysUntilBirthday;
        
        if (days === null) {
            return 'No birthdate set for this contact';
        }
        
        if (days === 0) {
            return '🎉 Ahoy! Today be the birthday! 🎉';
        }
        
        if (days === 1) {
            return 'Tomorrow be the birthday - prepare the festivities!';
        }
        
        return `${days} days until the birthday celebration`;
    }

    // Show the card only if we have valid data to display
    get showCard() {
        return this.birthdate !== undefined && !this.error;
    }
}