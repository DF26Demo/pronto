import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import BIRTHDATE_FIELD from '@salesforce/schema/Contact.Birthdate';

export default class BirthdayCountdown extends LightningElement {
    @api recordId;

    // Arr, we be fetchin' the birthdate from the contact record
    @wire(getRecord, { recordId: '$recordId', fields: [BIRTHDATE_FIELD] })
    contact;

    get birthdate() {
        // Blimey! Extract the birthdate or return null if the seas be empty
        return getFieldValue(this.contact.data, BIRTHDATE_FIELD);
    }

    get daysUntilBirthday() {
        if (!this.birthdate) {
            // Avast! No birthdate found, abandon ship early
            return null;
        }

        const today = new Date();
        const birth = new Date(this.birthdate);
        
        // Here be the magic — set this year's birthday, matey
        const nextBirthday = new Date(
            today.getFullYear(),
            birth.getMonth(),
            birth.getDate()
        );

        // If the birthday already passed this year, set sail for next year
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Calculate the days between now and the next birthday like a true navigator
        const diffTime = nextBirthday - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    get displayMessage() {
        const days = this.daysUntilBirthday;
        
        if (days === null) {
            return 'No birthdate on record, ye scallywag!';
        }
        
        if (days === 0) {
            return '🎉 Shiver me timbers! Today be the birthday!';
        }
        
        if (days === 1) {
            return '🎂 Tomorrow be the birthday, prepare the grog!';
        }
        
        return `🏴‍☠️ ${days} days until the birthday celebration!`;
    }

    get hasError() {
        // Walk the plank if there be an error loading the record
        return this.contact.error;
    }

    get isLoading() {
        // Still hoisting the sails if data ain't loaded yet
        return !this.contact.data && !this.contact.error;
    }
}